import { api } from '@/lib/api';
import { getDict } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { ListWithMap } from '@/components/tours/list-with-map';
import type { Tour } from '@/lib/types';

interface SearchParams {
  q?: string;
  category?: string;
  difficulty?: string;
  duration?: 'halfDay' | 'fullDay' | 'multiDay';
  priceMin?: string;
  priceMax?: string;
  onlyAvailable?: string;
  sort?: 'departure_asc' | 'price_asc' | 'created_desc' | 'popular';
}

function durationBounds(d?: string): {
  durationMax?: number;
  durationMin?: number;
} {
  if (d === 'halfDay' || d === 'fullDay') return { durationMax: 1 };
  if (d === 'multiDay') return { durationMin: 2 };
  return {};
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  const { durationMax, durationMin } = durationBounds(searchParams.duration);

  let tours: Tour[] = [];
  try {
    const res = await api.listTours({
      q: searchParams.q,
      categories: searchParams.category ? [searchParams.category] : undefined,
      difficulty: searchParams.difficulty,
      durationMax,
      durationMin,
      priceMin: searchParams.priceMin
        ? Number(searchParams.priceMin)
        : undefined,
      priceMax: searchParams.priceMax
        ? Number(searchParams.priceMax)
        : undefined,
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
