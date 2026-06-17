'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Props {
  tourId: string;
  className?: string;
}

export function SaveHeartButton({ tourId, className }: Props) {
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
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setBusy(true);
    try {
      if (saved) {
        await userApi.unlike(tourId);
        setSaved(false);
      } else {
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
