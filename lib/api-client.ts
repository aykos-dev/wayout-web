'use client';

import { getStoredToken } from './auth';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

async function request<T>(
  path: string,
  opts: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
};
