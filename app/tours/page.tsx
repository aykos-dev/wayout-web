import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getDict } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { ListWithMap } from '@/components/tours/list-with-map';
import type { Tour } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Tours',
  description:
    'Browse and book nature tours across Uzbekistan — day trips, weekend treks and multi-day adventures from trusted local guides.',
  alternates: { canonical: '/tours' },
  openGraph: {
    type: 'website',
    url: '/tours',
    title: 'Tours · Outway',
    description:
      'Browse and book nature tours across Uzbekistan — day trips, weekend treks and multi-day adventures.',
  },
};

interface SearchParams {
  q?: string;
  category?: string;
  categories?: string | string[];
  difficulty?: string;
  duration?: 'oneDay' | 'multiDay';
  priceMin?: string;
  priceMax?: string;
  dateFrom?: string;
  dateTo?: string;
  onlyAvailable?: string;
  sort?: 'departure_asc' | 'price_asc' | 'created_desc' | 'popular';
}

function durationBounds(d?: string): {
  durationMax?: number;
  durationMin?: number;
} {
  if (d === 'oneDay') return { durationMax: 1 };
  if (d === 'multiDay') return { durationMin: 2 };
  return {};
}

function readCategories(sp: SearchParams): string[] | undefined {
  const raw = sp.categories ?? sp.category;
  if (!raw) return undefined;
  const list = Array.isArray(raw) ? raw : raw.split(',');
  const out = list.map((s) => s.trim()).filter(Boolean);
  return out.length > 0 ? out : undefined;
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  const { durationMin, durationMax } = durationBounds(searchParams.duration);

  let tours: Tour[] = [];
  try {
    const res = await api.listTours({
      q: searchParams.q,
      categories: readCategories(searchParams),
      difficulty: searchParams.difficulty,
      durationMin,
      durationMax,
      priceMin: searchParams.priceMin
        ? Number(searchParams.priceMin)
        : undefined,
      priceMax: searchParams.priceMax
        ? Number(searchParams.priceMax)
        : undefined,
      dateFrom: searchParams.dateFrom || undefined,
      dateTo: searchParams.dateTo || undefined,
      sort: searchParams.sort ?? 'departure_asc',
      limit: 50,
    });
    tours = res.items;
  } catch {
    tours = [];
  }

  if (searchParams.onlyAvailable === 'true') {
    tours = tours.filter((tour) => tour.seatsAvailable > 0);
  }

  return <ListWithMap tours={tours} lang={lang} dict={dict} />;
}
