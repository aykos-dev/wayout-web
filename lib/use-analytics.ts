'use client';

import { useMemo } from 'react';
import {
  track,
  setAnalyticsUser,
  setAnalyticsLang,
  type EventParams,
} from './analytics';

interface AnalyticsApi {
  track: (name: string, params?: EventParams) => void;
  identify: (user: { id: string; lang?: string } | null) => void;
  setLang: (lang: string) => void;
}

/**
 * Fire-and-forget analytics for client components.
 * `track` never throws and never blocks rendering.
 */
export function useAnalytics(): AnalyticsApi {
  return useMemo<AnalyticsApi>(
    () => ({
      track,
      identify: setAnalyticsUser,
      setLang: setAnalyticsLang,
    }),
    [],
  );
}
