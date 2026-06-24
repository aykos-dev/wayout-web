'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  placeId: string;
  slug?: string;
  category?: string;
  difficulty?: string;
  region?: string;
}

export function PlaceViewTracker({ placeId, slug, category, difficulty, region }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track('view_item', {
      content_type: 'place',
      item_id: placeId,
      slug,
      category,
      difficulty,
      region,
    });
  }, [placeId, slug, category, difficulty, region]);

  return null;
}
