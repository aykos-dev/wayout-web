import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { DestinationsListWithMap } from '@/components/destinations/destinations-list-with-map';
import type { Place } from '@/lib/types';

interface SearchParams {
  q?: string;
  region?: string;
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
      region: searchParams.region,
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

  // For the filter pills we need the universe of regions/categories. The
  // backend doesn't expose facets yet, so derive them from a wide single-page
  // pull (good enough at v1 scale, swap for a dedicated /facets call later).
  let regions: string[] = [];
  let categories: string[] = [];
  try {
    const all = await api.listPlaces({ limit: 100 });
    regions = Array.from(
      new Set(all.items.map((p) => p.region).filter((r): r is string => !!r)),
    ).sort();
    categories = Array.from(
      new Set(all.items.flatMap((p) => p.destinationCategories ?? [])),
    ).sort();
  } catch {
    regions = [];
    categories = [];
  }

  const hasActiveFilters = Boolean(
    searchParams.q ||
      searchParams.region ||
      searchParams.category ||
      searchParams.difficulty,
  );

  const title = t(dict, 'destinations', 'title');
  const subtitle = t(dict, 'destinations', 'subtitle');
  const countLabel = t(dict, 'destinations', 'count').replace(
    '{{count}}',
    String(total),
  );

  return (
    <>
      <section className="border-b border-hairline">
        <div className="container-airbnb flex flex-col gap-2 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-display-lg text-ink">{title}</h1>
            <p className="mt-1 text-body-md text-muted">{subtitle}</p>
          </div>
          <div className="text-body-sm text-muted">{countLabel}</div>
        </div>
      </section>

      <DestinationsListWithMap
        places={items}
        total={total}
        page={page}
        limit={limit}
        lang={lang}
        dict={dict}
        regions={regions}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
      />
    </>
  );
}

export const metadata = {
  title: 'Destinations · Outway',
  description: 'Browse every place we run tours to.',
};
