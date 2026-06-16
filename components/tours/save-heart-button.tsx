'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';

interface Props {
  tourId: string;
  className?: string;
  defaultSaved?: boolean;
}

export function SaveHeartButton({ tourId, className, defaultSaved }: Props) {
  const auth = useAuth();
  const [saved, setSaved] = useState(!!defaultSaved);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!auth.token) {
      setSaved(false);
      return;
    }
    userApi
      .myLikedIds()
      .then((ids) => setSaved(ids.includes(tourId)))
      .catch(() => undefined);
  }, [auth.token, tourId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    if (!auth.user) {
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setPending(true);
    const next = !saved;
    setSaved(next);
    try {
      if (next) await userApi.like(tourId);
      else await userApi.unlike(tourId);
    } catch {
      setSaved((s) => !s);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
      onClick={toggle}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur transition-colors hover:bg-white',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          saved ? 'fill-primary text-primary' : 'text-ink',
        )}
        strokeWidth={2.2}
      />
    </button>
  );
}
