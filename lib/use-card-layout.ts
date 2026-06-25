'use client';

import { useEffect, useState } from 'react';
import { CARD_LAYOUT, resolveCardLayout, type CardLayout } from './card-layout';

/**
 * Returns the active card layout. SSR/first paint uses the env default
 * (`CARD_LAYOUT`); after mount it applies any `?cardLayout=` query override.
 * Reads `window.location.search` directly to stay SSR-safe (no Suspense
 * boundary needed, unlike `useSearchParams`).
 */
export function useCardLayout(): CardLayout {
  const [layout, setLayout] = useState<CardLayout>(CARD_LAYOUT);
  useEffect(() => {
    setLayout(resolveCardLayout(window.location.search));
  }, []);
  return layout;
}
