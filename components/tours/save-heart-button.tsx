'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { trackEvent } from '@/lib/analytics-events';

interface Props {
  tourId: string;
  className?: string;
  surface?: 'card' | 'detail';
}

export function SaveHeartButton({ tourId, className, surface = 'card' }: Props) {
  const auth = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth.token) return;
    userApi
      .myLikedIds()
      .then((ids) => setSaved(ids.includes(tourId)))
      .catch(() => undefined);
  }, [auth.token, tourId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!auth.token) {
      track('auth_modal_open', { trigger: 'like', tour_id: tourId });
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setBusy(true);
    try {
      if (saved) {
        track('tour_unlike', { tour_id: tourId, surface });
        await userApi.unlike(tourId);
        setSaved(false);
      } else {
        track('tour_like', { tour_id: tourId, surface });
        // Growth-funnel signal (distinct from the Firebase 'tour_like' event).
        trackEvent('tour_save', { tourId, surface });
        await userApi.like(tourId);
        setSaved(true);
      }
    } catch {
      // swallow — UI just reverts to prior state on next mount
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Unsave tour' : 'Save tour'}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105',
        className,
      )}
    >
      <Heart
        className={cn(
          'size-4',
          saved
            ? 'fill-rausch-500 text-rausch-500'
            : 'text-ink-muted',
        )}
      />
    </button>
  );
}
