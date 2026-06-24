'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getStartTarget } from '@/lib/telegram';
import { trackEvent } from '@/lib/analytics-events';

/**
 * Honors Mini App deep links: when the app is opened via
 * `https://t.me/<bot>/<app>?startapp=tour_<slug>`, route straight to that
 * tour/destination instead of the home screen. Runs once per app open.
 */
export function StartParamRouter() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const target = getStartTarget();
    if (!target) return;
    handled.current = true;

    // Attribute the open back to its DM campaign, if the link was tagged.
    if (target.src) {
      trackEvent('notification_opened', { campaign: target.src });
    }

    if (target.type === 'tour') {
      router.replace(`/tours/${target.slug}`);
    } else if (target.type === 'place' || target.type === 'destination') {
      router.replace(`/destinations/${target.slug}`);
    } else if (target.type === 'profile') {
      router.replace('/profile/me');
    } else if (target.type === 'contest') {
      router.replace('/contest');
    }
  }, [router]);

  return null;
}
