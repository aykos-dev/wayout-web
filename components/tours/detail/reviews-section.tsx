'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import type { Review, ReviewEligibility } from '@/lib/types';

interface Props {
  tourId: string;
  initialReviews: Review[];
  title: string;
}

export function ReviewsSection({ tourId, initialReviews, title }: Props) {
  const auth = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);

  useEffect(() => {
    if (!auth.token) return;
    userApi
      .reviewEligibility(tourId)
      .then(setEligibility)
      .catch(() => setEligibility(null));
  }, [auth.token, tourId]);

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-display-sm text-ink">{title}</h3>
        {reviews.length > 0 && (
          <div className="inline-flex items-center gap-1 text-body-sm text-muted">
            <Star className="size-4 fill-ink text-ink" />
            <span className="text-ink">{avg.toFixed(1)}</span>
            <span>· {reviews.length}</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-body-md text-muted">No reviews yet.</p>
      ) : (
        <ul className="mt-4 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-hairline pb-5 last:border-0">
              <div className="flex items-center gap-2 text-title-sm text-ink">
                <span>{r.author.name}</span>
                <span className="inline-flex items-center gap-0.5 text-warning-fg">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span className="text-body-sm text-muted">
                  · {format(new Date(r.createdAt), 'PP')}
                </span>
              </div>
              {r.body && (
                <p className="mt-2 whitespace-pre-line text-body-md text-body">
                  {r.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {eligibility?.canReview && (
        <ReviewComposer
          tourId={tourId}
          onSubmitted={(r) => setReviews((prev) => [r, ...prev])}
        />
      )}
      {eligibility && !eligibility.canReview && eligibility.finished && eligibility.existingReviewId && (
        <p className="mt-4 text-xs text-muted">You already reviewed this tour.</p>
      )}
    </div>
  );
}

function ReviewComposer({
  tourId,
  onSubmitted,
}: {
  tourId: string;
  onSubmitted: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const r = (await userApi.submitReview(tourId, {
        rating,
        body: body.trim() || undefined,
      })) as unknown as Review;
      onSubmitted({
        id: r.id,
        rating: r.rating,
        body: r.body,
        photoUrls: r.photoUrls ?? [],
        createdAt: r.createdAt ?? new Date().toISOString(),
        author: { name: 'You' },
      });
      setBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-md border border-hairline p-4">
      <p className="text-title-sm text-ink">Leave a review</p>
      <div className="mt-2 inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="text-warning-fg"
            aria-label={`${n} stars`}
          >
            <Star
              className={`size-5 ${n <= rating ? 'fill-current' : 'text-muted'}`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="What was it like?"
        className="mt-3 w-full rounded-md border border-hairline bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
      />
      {error && <p className="mt-2 text-xs text-rausch-700">{error}</p>}
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
