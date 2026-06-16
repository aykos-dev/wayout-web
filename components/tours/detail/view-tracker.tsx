'use client';

import { useEffect, useRef } from 'react';
import { userApi } from '@/lib/api-client';

interface Props {
  tourId: string;
}

export function ViewTracker({ tourId }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void userApi.trackView(tourId);
  }, [tourId]);

  return null;
}
