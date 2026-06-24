'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

/**
 * Photo entry form. Users pick a tour they joined, upload a photo and add a
 * caption. Only rendered while the contest is in its submission phase.
 */
export function ContestSubmissionForm({ onSubmitted }: { onSubmitted: () => void }) {
  const auth = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [tourId, setTourId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const interests = useQuery({
    queryKey: ['my-interests'],
    queryFn: () => userApi.myInterests(),
    enabled: !!auth.token,
  });
  const eligibleTours = (interests.data ?? [])
    .filter((i) => i.status === 'confirmed' && i.tour)
    .map((i) => i.tour!);

  if (!auth.token) {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft p-5 text-center">
        <p className="text-body-sm text-muted">Sign in to enter the contest.</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-3"
          onClick={() => void auth.requestLogin().catch(() => undefined)}
        >
          Sign in
        </Button>
      </div>
    );
  }

  async function submit() {
    if (!file || !tourId) {
      setError('Pick a tour and a photo.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const [url] = await userApi.uploadPhotos([file]);
      if (!url) throw new Error('Upload failed');
      await userApi.contestSubmit({ photoUrl: url, caption: caption || undefined, tourId });
      setDone(true);
      setFile(null);
      setCaption('');
      setTourId('');
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-primary/30 bg-primary-soft p-5 text-center text-body-sm text-primary-active">
        🎉 Your photo is in! Good luck.
        <button
          className="ml-2 underline"
          onClick={() => setDone(false)}
          type="button"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-hairline bg-canvas p-5">
      <h3 className="text-title-md text-ink">Enter your photo</h3>

      {eligibleTours.length === 0 ? (
        <p className="text-body-sm text-muted">
          You can submit photos from tours you&apos;ve joined. Join a tour first!
        </p>
      ) : (
        <>
          <select
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="w-full rounded-sm border border-hairline px-3 py-2 text-body-sm"
          >
            <option value="">Select a tour you joined…</option>
            {eligibleTours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title ?? t.slug}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-hairline px-3 py-2.5 text-body-sm text-muted hover:border-primary">
            <ImagePlus className="size-4" />
            {file ? file.name : 'Choose a photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            maxLength={280}
            rows={2}
            className="w-full rounded-sm border border-hairline px-3 py-2 text-body-sm"
          />

          {error && <p className="text-caption text-error-text">{error}</p>}

          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={submit}
            className="w-full"
          >
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit entry
          </Button>
        </>
      )}
    </div>
  );
}
