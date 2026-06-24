'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics-events';

const SESSION_KEY = 'booktrip.opened';

/** Records one `app_open` per browser session — the core DAU/MAU signal. */
export function ActivityTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* sessionStorage unavailable — still track once per mount */
    }
    trackEvent('app_open');
  }, []);
  return null;
}
