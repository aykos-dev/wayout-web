'use client';

import { getStoredToken } from './auth';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

/** Current UI language from the `booktrip.lang` cookie (drives backend i18n). */
function getLang(): string {
  const fallback = process.env.NEXT_PUBLIC_DEFAULT_LANG ?? 'uz';
  if (typeof document === 'undefined') return fallback;
  const m = document.cookie.match(/(?:^|;\s*)booktrip\.lang=([^;]+)/);
  return m?.[1] ?? fallback;
}

async function request<T>(
  path: string,
  opts: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Lang': getLang(),
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${path}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

import type { AuthUser } from './auth';
import type {
  DestinationCategory,
  Review,
  ReviewEligibility,
} from './types';

export interface NotificationPrefs {
  marketingOptOut: boolean;
  weekendDigest: boolean;
  savedTourAlerts: boolean;
  orgNewTour: boolean;
}

export const userApi = {
  quickRegister(payload: {
    fullName: string;
    phone: string;
    email?: string;
  }) {
    return request<{ accessToken: string; user: AuthUser }>(
      '/auth/quick-register',
      { method: 'POST', body: JSON.stringify(payload) },
      false,
    );
  },
  me() {
    return request<AuthUser>('/auth/me');
  },

  // --- Telegram Mini App linking (background) ---
  linkTelegram(initData: string) {
    return request<{ ok: boolean; telegramId: string }>(
      '/auth/telegram/link',
      { method: 'POST', body: JSON.stringify({ initData }) },
    );
  },

  // --- Persist preferred language (so DMs are localized) ---
  setLocale(locale: string) {
    return request<{ ok: boolean; locale: string }>('/auth/locale', {
      method: 'PATCH',
      body: JSON.stringify({ locale }),
    });
  },

  // --- Telegram notification preferences ---
  getNotificationPrefs() {
    return request<NotificationPrefs>('/auth/notification-prefs');
  },
  setNotificationPrefs(patch: Partial<NotificationPrefs>) {
    return request<NotificationPrefs>('/auth/notification-prefs', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  // --- Express / cancel interest in a tour ---
  expressInterest(tourId: string, selectedDepartureDate?: string) {
    return request<unknown>(`/tours/${tourId}/interest`, {
      method: 'POST',
      body: selectedDepartureDate
        ? JSON.stringify({ selectedDepartureDate })
        : undefined,
    });
  },
  cancelInterest(tourId: string) {
    return request<unknown>(`/tours/${tourId}/interest`, { method: 'DELETE' });
  },

  // --- Save (like) ---
  like(tourId: string) {
    return request<unknown>(`/tours/${tourId}/like`, { method: 'POST' });
  },
  unlike(tourId: string) {
    return request<unknown>(`/tours/${tourId}/like`, { method: 'DELETE' });
  },
  myLikedIds() {
    return request<string[]>('/users/me/liked-ids');
  },

  // --- Reviews ---
  reviewEligibility(tourId: string) {
    return request<ReviewEligibility>(`/tours/${tourId}/review/eligibility`);
  },
  myReview(tourId: string) {
    return request<{
      id: string;
      rating: number;
      body: string | null;
    } | null>(`/tours/${tourId}/review`);
  },
  submitReview(
    tourId: string,
    payload: { rating: number; body?: string; photoUrls?: string[] },
  ) {
    return request<Review>(`/tours/${tourId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  deleteReview(tourId: string) {
    return request<unknown>(`/tours/${tourId}/review`, { method: 'DELETE' });
  },

  // --- View tracking (anonymous, fire-and-forget) ---
  trackView(tourId: string) {
    return request<void>(
      `/tours/${tourId}/view`,
      { method: 'POST' },
      false,
    ).catch(() => undefined);
  },

  // --- Profile management ---
  updateProfile(payload: {
    fullName?: string;
    phone?: string;
    email?: string;
    preferredDestinations?: DestinationCategory[];
    preferredPriceMax?: number;
  }) {
    return request<AuthUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // --- Gamification: XP, badges, leaderboard privacy ---
  getMyXp() {
    return request<XpSummary>('/users/me/xp');
  },
  getMyBadges() {
    return request<MyBadge[]>('/users/me/badges');
  },
  getLeaderboardPrivacy() {
    return request<{ hiddenFromLeaderboard: boolean }>('/users/me/privacy');
  },
  setLeaderboardPrivacy(hiddenFromLeaderboard: boolean) {
    return request<{ hiddenFromLeaderboard: boolean }>('/users/me/privacy', {
      method: 'PATCH',
      body: JSON.stringify({ hiddenFromLeaderboard }),
    });
  },

  // --- My interests (for the contest tour selector) ---
  myInterests() {
    return request<MyInterest[]>('/users/me/interests');
  },

  // --- Contest (auth-gated actions) ---
  contestMyVotes() {
    return request<string[]>('/contests/current/my-votes');
  },
  contestSubmit(payload: { photoUrl: string; caption?: string; tourId: string }) {
    return request<ContestEntry>('/contests/current/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  contestVote(submissionId: string) {
    return request<{ voted: boolean }>(`/contests/current/vote/${submissionId}`, {
      method: 'POST',
    });
  },
  contestUnvote(submissionId: string) {
    return request<{ voted: boolean }>(`/contests/current/vote/${submissionId}`, {
      method: 'DELETE',
    });
  },

  // --- User media upload (multipart) ---
  async uploadPhotos(files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const token = getStoredToken();
    const res = await fetch(`${BASE}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(`upload failed: ${res.status}`);
    const data = (await res.json()) as { urls?: string[] } | string[];
    return Array.isArray(data) ? data : (data.urls ?? []);
  },
};

/** Anonymous, public reads (no auth header). */
export const publicApi = {
  badges() {
    return request<BadgeDef[]>('/badges', {}, false);
  },
  leaderboard(cursor?: string, limit = 20) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (cursor) q.set('cursor', cursor);
    return request<LeaderboardPage>(`/leaderboard?${q.toString()}`, {}, false);
  },
  profile(userId: string) {
    return request<PublicProfile>(`/users/${userId}/profile`, {}, false);
  },
  contestCurrent() {
    return request<ContestCurrent | null>('/contests/current', {}, false);
  },
  contestEntries(page = 1, limit = 24) {
    return request<ContestEntriesPage>(
      `/contests/current/entries?page=${page}&limit=${limit}`,
      {},
      false,
    );
  },
  contestLeaderboard() {
    return request<ContestEntry[]>('/contests/current/leaderboard', {}, false);
  },
  contestHistory() {
    return request<ContestHistoryItem[]>('/contests/history', {}, false);
  },
};

// --- Gamification / contest types ---

export interface LevelInfo {
  level: number;
  name: string;
  currentLevelXp: number;
  nextLevelXp: number | null;
  progressPct: number;
}

export interface XpSummary extends LevelInfo {
  xp: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  tier: number;
  criteriaType: string;
  criteriaCount: number;
  sort: number;
}

export interface MyBadge {
  id: string;
  name: string;
  description: string;
  tier: number;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  target: number;
}

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  tier: number;
  earnedAt: string;
}

export interface PublicProfile extends LevelInfo {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  xp: number;
  joinedAt: string;
  badges: ProfileBadge[];
}

export interface LeaderboardEntry extends LevelInfo {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  xp: number;
  badgeIds: string[];
}

export interface LeaderboardPage {
  items: LeaderboardEntry[];
  nextCursor: string | null;
}

export interface MyInterest {
  id: string;
  status: string;
  tour: { id: string; title: string | null; slug: string } | null;
}

export type ContestStatus = 'submissions' | 'voting' | 'closed';

export interface ContestCurrent {
  id: string;
  year: number;
  month: number;
  status: ContestStatus;
  prizeDescription: string | null;
  winnerSubmissionId: string | null;
  daysLeft: number;
  entryCount: number;
}

export interface ContestEntry {
  id: string;
  photoUrl: string;
  caption: string | null;
  tourId: string;
  voteCount: number;
  submittedAt: string;
  author: { name: string | null; avatarUrl: string | null };
}

export interface ContestEntriesPage {
  items: ContestEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ContestHistoryItem {
  id: string;
  year: number;
  month: number;
  prizeDescription: string | null;
  winner: {
    id: string;
    photoUrl: string;
    caption: string | null;
    voteCount: number;
  } | null;
}
