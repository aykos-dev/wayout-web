'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

/** Shared cache key — every heart button reads the user's liked-ids from here. */
const LIKED_KEY = ['liked-ids'] as const;

export function SaveHeartButton({ tourId, className, surface = 'card' }: Props) {
  const auth = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  // One shared, cached query for the whole page: React Query dedupes the
  // concurrent mounts of many cards into a single `/users/me/liked-ids` request
  // (instead of one request per heart button).
  const { data: likedIds } = useQuery({
    queryKey: LIKED_KEY,
    queryFn: () => userApi.myLikedIds(),
    enabled: !!auth.token,
    staleTime: 5 * 60 * 1000,
  });

  const saved = !!likedIds?.includes(tourId);

  function writeCache(add: boolean) {
    qc.setQueryData<string[]>(LIKED_KEY, (prev = []) =>
      add
        ? Array.from(new Set([...prev, tourId]))
        : prev.filter((id) => id !== tourId),
    );
  }

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
    const willSave = !saved;
    setBusy(true);
    writeCache(willSave); // optimistic; shared across all heart buttons
    try {
      if (willSave) {
        track('tour_like', { tour_id: tourId, surface });
        // Growth-funnel signal (distinct from the Firebase 'tour_like' event).
        trackEvent('tour_save', { tourId, surface });
        await userApi.like(tourId);
      } else {
        track('tour_unlike', { tour_id: tourId, surface });
        await userApi.unlike(tourId);
      }
    } catch {
      writeCache(!willSave); // revert on failure
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
          saved ? 'fill-rausch-500 text-rausch-500' : 'text-ink-muted',
        )}
      />
    </button>
  );
}
