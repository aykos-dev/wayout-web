'use client';

import { useEffect, useRef } from 'react';
import { userApi } from '@/lib/api-client';
import { track } from '@/lib/analytics';
import { trackEvent } from '@/lib/analytics-events';

interface Props {
  tourId: string;
  slug?: string;
  orgId?: string;
  category?: string;
  difficulty?: string;
  price?: number;
  currency?: string;
}

export function ViewTracker({
  tourId,
  slug,
  orgId,
  category,
  difficulty,
  price,
  currency,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track('view_item', {
      item_id: tourId,
      content_type: 'tour',
      slug,
      org_id: orgId,
      category,
      difficulty,
      price,
      currency,
    });
    void userApi.trackView(tourId);
    trackEvent('tour_view', { tourId, slug });
  }, [tourId, slug, orgId, category, difficulty, price, currency]);

  return null;
}
