'use client';

import { getStoredToken } from './auth';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';
const ANON_KEY = 'booktrip.anon';

/** Stable per-device id so anonymous visitors count as one actor for DAU/MAU. */
function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

/**
 * Fire-and-forget activity event to the backend growth log. Never throws.
 * Attaches the auth token when present so signed-in actions count under the
 * stable user id rather than the anonymous device id.
 */
export function trackEvent(
  event: string,
  meta?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  void fetch(`${BASE}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ event, anonId: getAnonId(), meta }),
    keepalive: true,
  }).catch(() => undefined);
}
