import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { DestinationsListWithMap } from '@/components/destinations/destinations-list-with-map';
import type { Place } from '@/lib/types';

interface SearchParams {
  q?: string;
  category?: string;
  difficulty?: string;
  page?: string;
  limit?: string;
}

const DEFAULT_LIMIT = 24;

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.max(
    1,
    Math.min(100, Number(searchParams.limit) || DEFAULT_LIMIT),
  );

  let items: Place[] = [];
  let total = 0;
  try {
    const res = await api.listPlaces({
      q: searchParams.q,
      category: searchParams.category,
      difficulty: searchParams.difficulty,
      page,
      limit,
    });
    items = res.items;
    total = res.total;
  } catch {
    items = [];
    total = 0;
  }

  // Categories for the filter pill. The backend doesn't expose facets yet,
  // so derive them from a wide single-page pull (fine at v1 scale).
  let categories: string[] = [];
  try {
    const all = await api.listPlaces({ limit: 100 });
    categories = Array.from(
      new Set(all.items.flatMap((p) => p.destinationCategories ?? [])),
    ).sort();
  } catch {
    categories = [];
  }

  const hasActiveFilters = Boolean(
    searchParams.q || searchParams.category || searchParams.difficulty,
  );

  const title = t(dict, 'destinations', 'title');
  const subtitle = t(dict, 'destinations', 'subtitle');

  return (
    <>
      <section className="border-b border-hairline">
        <div className="container-airbnb py-10">
          <h1 className="text-display-lg text-ink">{title}</h1>
          <p className="mt-1 text-body-md text-muted">{subtitle}</p>
        </div>
      </section>

      <DestinationsListWithMap
        places={items}
        total={total}
        page={page}
        limit={limit}
        lang={lang}
        dict={dict}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
      />
    </>
  );
}

export const metadata = {
  title: 'Destinations',
  description:
    'Explore the lakes, peaks, canyons and waterfalls of Uzbekistan — every destination Outway runs guided nature tours to.',
  alternates: { canonical: '/destinations' },
  openGraph: {
    type: 'website',
    url: '/destinations',
    title: 'Destinations · Outway',
    description:
      'Explore the lakes, peaks, canyons and waterfalls of Uzbekistan with Outway.',
  },
};
