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
import type { DestinationCategory, Review, ReviewEligibility, Tour } from './types';

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
  like(tourId: string) {
    return request<unknown>(`/tours/${tourId}/like`, { method: 'POST' });
  },
  unlike(tourId: string) {
    return request<unknown>(`/tours/${tourId}/like`, { method: 'DELETE' });
  },
  myInterests() {
    return request<
      Array<{
        id: string;
        status: 'pending' | 'cancelled';
        createdAt: string;
        cancelledAt: string | null;
        tour: Tour;
      }>
    >('/users/me/interests');
  },
  myLiked() {
    return request<Tour[]>('/users/me/liked');
  },
  myLikedIds() {
    return request<string[]>('/users/me/liked-ids');
  },
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
    payload: { rating: number; body: string; photoUrls?: string[] },
  ) {
    return request<Review>(`/tours/${tourId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  deleteReview(tourId: string) {
    return request<unknown>(`/tours/${tourId}/review`, { method: 'DELETE' });
  },

  // --- View tracking ---
  trackView(tourId: string) {
    return request<void>(`/tours/${tourId}/view`, { method: 'POST' }, false).catch(
      () => undefined,
    );
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

  // --- Media upload (user-auth) ---
  async uploadFiles(files: File[]): Promise<string[]> {
    const token = getStoredToken();
    if (!token) throw new Error('not_authenticated');
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await fetch(`${BASE}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(`upload_failed_${res.status}`);
    const body = (await res.json()) as { urls: string[] };
    return body.urls;
  },
};
