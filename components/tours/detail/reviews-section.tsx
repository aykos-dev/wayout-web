'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from './star-rating';
import { Lightbox } from './lightbox';
import { ReviewFormModal } from './review-form-modal';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import type { Review, ReviewEligibility } from '@/lib/types';

interface Props {
  title: string;
  tourId: string;
  initialReviews: Review[];
}

export function ReviewsSection({ title, tourId, initialReviews }: Props) {
  const auth = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [elig, setElig] = useState<ReviewEligibility | null>(null);
  const [my, setMy] = useState<{ rating: number; body: string | null } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const refreshAll = useCallback(async () => {
    try {
      const fresh = await fetchReviewsPublic(tourId);
      setReviews(fresh);
    } catch {
      /* ignore */
    }
    if (!auth.token) {
      setElig(null);
      setMy(null);
      return;
    }
    try {
      const e = await userApi.reviewEligibility(tourId);
      setElig(e);
    } catch {
      /* ignore */
    }
    try {
      const mine = await userApi.myReview(tourId);
      setMy(mine ? { rating: mine.rating, body: mine.body } : null);
    } catch {
      setMy(null);
    }
  }, [auth.token, tourId]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const onWriteClick = async () => {
    if (!auth.user) {
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setModalOpen(true);
  };

  const writeButton =
    elig?.canReview || !auth.token ? (
      <Button
        variant={my ? 'secondary' : 'primary'}
        size="sm"
        onClick={onWriteClick}
      >
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        {my ? 'Edit your review' : 'Write a review'}
      </Button>
    ) : null;

  const reason = !elig
    ? null
    : elig.canReview
      ? null
      : !elig.finished
        ? 'You can review this tour after the return date.'
        : !elig.hasJoined
          ? 'Only travellers who booked this tour can review it.'
          : null;

  const avg =
    reviews.length === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
        ) / 10;

  // Rating histogram distribution
  const histogram = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    for (const r of reviews) {
      const idx = Math.min(Math.max(r.rating, 1), 5) - 1;
      counts[idx]++;
    }
    return counts;
  }, [reviews]);

  // Collect all review photos for the photo strip
  const allPhotos = useMemo(() => {
    const photos: { url: string; globalIndex: number }[] = [];
    for (const r of reviews) {
      if (r.photoUrls && r.photoUrls.length > 0) {
        for (const url of r.photoUrls) {
          photos.push({ url, globalIndex: photos.length });
        }
      }
    }
    return photos;
  }, [reviews]);

  const allPhotoUrls = useMemo(
    () => allPhotos.map((p) => p.url),
    [allPhotos],
  );

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-display-sm text-ink">{title}</h3>
          {reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2 text-body-sm text-muted">
              <StarRating value={Math.round(avg)} readOnly size="sm" />
              <span>
                {avg} · {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>
        {writeButton}
      </div>

      {reason && (
        <p className="mt-3 text-body-sm text-muted">{reason}</p>
      )}

      {/* Rating histogram */}
      {reviews.length > 0 && (
        <div className="mt-6 flex gap-8 rounded-lg border border-hairline p-5">
          {/* Left: average summary */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-display-lg text-ink leading-none">
              {avg}
            </span>
            <StarRating value={Math.round(avg)} readOnly size="sm" />
            <span className="text-caption text-muted">
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Right: bar chart */}
          <div className="flex flex-1 flex-col justify-center gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = histogram[star - 1];
              const pct =
                reviews.length > 0
                  ? Math.round((count / reviews.length) * 100)
                  : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-body-sm">
                  <span className="w-4 text-right text-muted">{star}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-hairline">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-caption text-muted">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo strip */}
      {allPhotos.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {allPhotos.map((photo) => (
              <button
                key={`strip-${photo.globalIndex}`}
                type="button"
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md"
                onClick={() => openLightbox(allPhotoUrls, photo.globalIndex)}
              >
                <Image
                  src={photo.url}
                  alt={`Review photo ${photo.globalIndex + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="mt-4 text-body-md text-muted">
          Be the first to review this tour after departure.
        </p>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="space-y-2 rounded-md border border-hairline p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-title-sm text-ink">{r.author.name}</span>
                <StarRating value={r.rating} readOnly size="sm" />
              </div>
              {r.body && (
                <p className="text-body-sm text-body whitespace-pre-line">
                  {r.body}
                </p>
              )}
              {/* Review card photo thumbnails */}
              {r.photoUrls && r.photoUrls.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {r.photoUrls.map((url, i) => (
                    <button
                      key={`${r.id}-photo-${i}`}
                      type="button"
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded"
                      onClick={() => openLightbox(r.photoUrls, i)}
                    >
                      <Image
                        src={url}
                        alt={`Photo by ${r.author.name}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <p className="text-caption-sm text-muted">
                {format(new Date(r.createdAt), 'PP')}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox for review photos */}
      <Lightbox
        images={lightboxImages}
        alt="Review photo"
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />

      <ReviewFormModal
        tourId={tourId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={() => {
          void refreshAll();
        }}
        initialRating={my?.rating}
        initialBody={my?.body ?? ''}
      />
    </div>
  );
}

async function fetchReviewsPublic(tourId: string): Promise<Review[]> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';
  const res = await fetch(`${base}/tours/${tourId}/reviews`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return (await res.json()) as Review[];
}
