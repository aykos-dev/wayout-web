'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { StarRating } from './star-rating';
import { userApi } from '@/lib/api-client';

type Stage = 'closed' | 'editing' | 'pending' | 'success' | 'error';

const MAX_PHOTOS = 5;

interface Props {
  tourId: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  initialRating?: number;
  initialBody?: string;
}

export function ReviewFormModal({
  tourId,
  open,
  onClose,
  onSubmitted,
  initialRating,
  initialBody,
}: Props) {
  const [stage, setStage] = useState<Stage>('closed');
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStage('editing');
      setRating(initialRating ?? 0);
      setBody(initialBody ?? '');
      setError(null);
      setPhotos([]);
      setPhotoPreviews([]);
    } else {
      setStage('closed');
    }
  }, [open, initialRating, initialBody]);

  // Clean up object URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const available = MAX_PHOTOS - photos.length;
    const toAdd = newFiles.slice(0, available);

    if (toAdd.length > 0) {
      setPhotos((prev) => [...prev, ...toAdd]);
      setPhotoPreviews((prev) => [
        ...prev,
        ...toAdd.map((f) => URL.createObjectURL(f)),
      ]);
    }

    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (rating < 1) {
      setError('Please pick a rating.');
      return;
    }
    const trimmedBody = body.trim();
    if (trimmedBody.length < 4) {
      setError('Please write at least 4 characters in your review.');
      return;
    }
    setError(null);
    setStage('pending');
    try {
      // Upload photos first if any
      let photoUrls: string[] | undefined;
      if (photos.length > 0) {
        photoUrls = await userApi.uploadFiles(photos);
      }

      await userApi.submitReview(tourId, {
        rating,
        body: trimmedBody,
        photoUrls,
      });
      setStage('success');
      onSubmitted();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      setError(msg);
      setStage('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {(stage === 'editing' || stage === 'pending') && (
          <>
            <h2 className="text-display-sm text-ink">Leave a review</h2>
            <p className="mt-1 text-body-sm text-muted">
              Your review will be visible to other travellers. Be honest and
              helpful.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-caption text-ink">Rating</p>
                <div className="mt-2">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                  />
                </div>
              </div>
              <label className="block space-y-2">
                <span className="text-caption text-ink">Your review</span>
                <textarea
                  rows={5}
                  required
                  minLength={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-sm border border-hairline px-3 py-2 text-body-md outline-none focus:border-ink"
                  maxLength={2000}
                  placeholder="What did you enjoy? What could the operator improve?"
                />
              </label>

              {/* Photo upload section */}
              <div className="space-y-2">
                <p className="text-caption text-ink">Add photos</p>
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photoPreviews.map((preview, i) => (
                      <div
                        key={i}
                        className="relative h-16 w-16 overflow-hidden rounded"
                      >
                        <Image
                          src={preview}
                          alt={`Upload preview ${i + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                          aria-label={`Remove photo ${i + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-hairline px-3 py-1.5 text-caption text-muted hover:border-ink hover:text-ink transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {photos.length === 0
                      ? 'Upload photos'
                      : `Add more (${photos.length}/${MAX_PHOTOS})`}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotosChange}
                />
              </div>

              {error && (
                <p className="text-body-sm text-error-text">{error}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={stage === 'pending' || rating < 1}
                onClick={submit}
              >
                {stage === 'pending' ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          </>
        )}

        {stage === 'success' && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-4 text-display-sm text-ink">Thanks!</h2>
            <p className="mt-2 text-body-md text-muted">
              Your review was saved.
            </p>
            <Button className="mt-6 w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {stage === 'error' && (
          <div>
            <h2 className="text-display-sm text-ink">Couldn't submit</h2>
            <p className="mt-2 text-body-sm text-error-text">
              {translateError(error)}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setStage('editing')}>Try again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function translateError(msg: string | null): string {
  if (!msg) return 'Something went wrong.';
  if (msg.includes('not_a_participant'))
    return 'Only travellers who booked this tour can review it.';
  if (msg.includes('tour_not_finished'))
    return 'You can review a tour after the return date.';
  if (msg.includes('401'))
    return 'Please sign in first.';
  return msg;
}
