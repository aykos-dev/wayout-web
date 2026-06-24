'use client';

/**
 * Minimal typing for the slice of the Telegram Mini App SDK we use.
 * Full surface: https://core.telegram.org/bots/webapps
 */
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; username?: string; first_name?: string };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram
      ?.WebApp ?? null
  );
}

/** True only when running inside Telegram with signed init data present. */
export function isTelegramMiniApp(): boolean {
  const wa = getTelegramWebApp();
  return !!wa && typeof wa.initData === 'string' && wa.initData.length > 0;
}

/**
 * The `startapp` parameter from a Mini App deep link, parsed into a target.
 * Scheme: `<type>_<slug>` (e.g. "tour_chimgan-hike"), with an optional
 * `__<src>` campaign suffix appended by attributed DMs
 * (e.g. "tour_chimgan-hike__weekendDigest"). The suffix is stripped from the
 * slug and returned as `src` so the caller can route *and* attribute. Returns
 * null if absent or malformed.
 */
export function getStartTarget(): {
  type: string;
  slug: string;
  src?: string;
} | null {
  const raw = getTelegramWebApp()?.initDataUnsafe?.start_param;
  if (!raw) return null;
  // Split off the optional campaign source first (slugs are kebab-case and
  // never contain a double underscore, so this is unambiguous).
  const sep = raw.indexOf('__');
  const src = sep >= 0 ? raw.slice(sep + 2) : undefined;
  const target = sep >= 0 ? raw.slice(0, sep) : raw;
  const i = target.indexOf('_');
  if (i <= 0) return null;
  const type = target.slice(0, i);
  const slug = target.slice(i + 1);
  return slug ? { type, slug, src: src || undefined } : null;
}
