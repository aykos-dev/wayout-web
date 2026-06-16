import type {
  OrganizationWithTours,
  Review,
  Tour,
  TourListResponse,
} from './types';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

export interface PublicListParams {
  orgId?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  difficulty?: string;
  durationMax?: number;
  durationMin?: number;
  sort?: 'departure_asc' | 'price_asc' | 'created_desc' | 'popular';
  q?: string;
  page?: number;
  limit?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      v.forEach((x) => qs.append(k, String(x)));
    } else {
      qs.set(k, String(v));
    }
  }
  return qs.toString();
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 30 },
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listTours(params: PublicListParams = {}) {
    const qs = toQuery(params as Record<string, unknown>);
    return getJson<TourListResponse>(`/tours${qs ? `?${qs}` : ''}`);
  },
  getTourBySlug(slug: string) {
    return getJson<Tour>(`/tours/by-slug/${encodeURIComponent(slug)}`);
  },
  getTourById(id: string) {
    return getJson<Tour>(`/tours/${id}`);
  },
  getOrganization(id: string) {
    return getJson<OrganizationWithTours>(
      `/organizations/${encodeURIComponent(id)}`,
    );
  },
  getTourReviews(id: string) {
    return getJson<Review[]>(`/tours/${encodeURIComponent(id)}/reviews`);
  },
  listFeatured(limit = 8) {
    return getJson<Tour[]>(`/tours/featured?limit=${limit}`);
  },
  listForYou(categories: string[], limit = 12) {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (categories.length > 0) qs.set('categories', categories.join(','));
    return getJson<Tour[]>(`/tours/for-you?${qs.toString()}`);
  },
};
