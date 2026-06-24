import { logEvent, setUserId, setUserProperties, type Analytics } from 'firebase/analytics';
import { initAnalytics } from './firebase';

const SESSION_KEY = 'booktrip.analytics.session';

type Primitive = string | number | boolean;
export type EventParams = Record<string, Primitive | Primitive[] | null | undefined>;

interface QueuedEvent {
  name: string;
  params: Record<string, Primitive>;
}

let analytics: Analytics | null = null;
let initStarted = false;
let initFailed = false;
const queue: QueuedEvent[] = [];

let sessionId: string | null = null;
let seq = 0;
let lang: string | undefined;
let userId: string | null = null;

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') {
    sessionId = genId();
    return sessionId;
  }
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      sessionId = existing;
      return existing;
    }
    const fresh = genId();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    sessionId = fresh;
    return fresh;
  } catch {
    sessionId = genId();
    return sessionId;
  }
}

function clamp(value: string, max = 100): string {
  return value.length <= max ? value : value.slice(0, max);
}

function flatten(params: EventParams | undefined): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      if (!v.length) continue;
      out[k] = clamp(v.map(String).join('|'));
    } else if (typeof v === 'string') {
      out[k] = clamp(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function ensureInit(): void {
  if (analytics || initStarted || initFailed) return;
  if (typeof window === 'undefined') return;
  initStarted = true;
  initAnalytics()
    .then((a) => {
      if (!a) {
        initFailed = true;
        queue.length = 0;
        return;
      }
      analytics = a;
      while (queue.length) {
        const e = queue.shift()!;
        try {
          logEvent(analytics, e.name, e.params);
        } catch {
          /* swallow */
        }
      }
    })
    .catch(() => {
      initFailed = true;
      queue.length = 0;
    });
}

function autoContext(): Record<string, Primitive> {
  const ctx: Record<string, Primitive> = {
    session_id: getSessionId(),
    seq: ++seq,
    auth_state: userId ? 'user' : 'anon',
  };
  if (lang) ctx.lang = lang;
  if (userId) ctx.user_id = userId;
  if (typeof window !== 'undefined') {
    ctx.path = clamp(window.location.pathname + window.location.search);
  }
  return ctx;
}

/**
 * Fire an analytics event. Non-blocking, never throws, never returns a promise.
 * Queues until firebase analytics initializes; drops silently if unsupported.
 */
export function track(name: string, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  if (initFailed) return;
  const merged = { ...autoContext(), ...flatten(params) };
  if (analytics) {
    try {
      logEvent(analytics, name, merged);
    } catch {
      /* swallow */
    }
    return;
  }
  queue.push({ name, params: merged });
  ensureInit();
}

/** Sync user id + properties with analytics. Pass null on logout. */
export function setAnalyticsUser(
  user: { id: string; lang?: string } | null,
  extraProps?: Record<string, Primitive>,
): void {
  userId = user?.id ?? null;
  if (user?.lang) lang = user.lang;
  if (typeof window === 'undefined') return;
  ensureInit();
  if (!analytics) return;
  try {
    setUserId(analytics, userId);
    if (extraProps) setUserProperties(analytics, extraProps);
  } catch {
    /* swallow */
  }
}

/** Update the current language used as event context. */
export function setAnalyticsLang(nextLang: string): void {
  lang = nextLang;
  if (analytics) {
    try {
      setUserProperties(analytics, { lang: nextLang });
    } catch {
      /* swallow */
    }
  }
}

/** Manually kick off init (idempotent). Called by FirebaseAnalytics host on mount. */
export function bootAnalytics(): void {
  ensureInit();
}
