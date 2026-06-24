'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import type { Place } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { PlaceGrid } from './place-grid';
import { DestinationsFilterBar } from './destinations-filter-bar';

const DestinationsMap = dynamic(
  () => import('./destinations-map').then((m) => m.DestinationsMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

function MapSkeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded-md bg-surface-soft" />
  );
}

interface Props {
  places: Place[];
  total: number;
  page: number;
  limit: number;
  lang: Lang;
  dict: Dictionary;
  categories: string[];
  hasActiveFilters: boolean;
}

export function DestinationsListWithMap({
  places,
  total,
  page,
  limit,
  lang,
  dict,
  categories,
  hasActiveFilters,
}: Props) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pageHref = (target: number) => {
    if (typeof window === 'undefined') return `?page=${target}`;
    const sp = new URLSearchParams(window.location.search);
    if (target <= 1) sp.delete('page');
    else sp.set('page', String(target));
    const qs = sp.toString();
    return qs ? `/destinations?${qs}` : '/destinations';
  };

  return (
    <>
      <DestinationsFilterBar
        dict={dict}
        total={total}
        onToggleMap={() => setMapVisible((v) => !v)}
        mapVisible={mapVisible}
        categories={categories}
      />

      <div className="container-airbnb py-6">
        {places.length === 0 ? (
          <div className="rounded-md border border-dashed border-hairline p-12 text-center text-body-md text-muted">
            <p>
              {hasActiveFilters
                ? t(dict, 'tours', 'list.noResults')
                : t(dict, 'destinations', 'empty')}
            </p>
            {hasActiveFilters && (
              <Link
                href="/destinations"
                className="mt-3 inline-block text-primary underline-offset-2 hover:underline"
              >
                {t(dict, 'destinations', 'filters.clear')}
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              'grid gap-6 ' +
              (mapVisible ? 'lg:grid-cols-[1.4fr_1fr]' : 'grid-cols-1')
            }
          >
            <div>
              <PlaceGrid
                places={places}
                lang={lang}
                dict={dict}
                cols={mapVisible ? 2 : 4}
                onHoverId={setHighlightId}
                listContext="destinations_list"
              />

              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-6 text-body-sm text-ink">
                  {page > 1 ? (
                    <Link
                      href={pageHref(page - 1)}
                      className="underline-offset-2 hover:underline"
                    >
                      ← Prev
                    </Link>
                  ) : (
                    <span className="text-muted">← Prev</span>
                  )}
                  <span className="text-muted">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={pageHref(page + 1)}
                      className="underline-offset-2 hover:underline"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="text-muted">Next →</span>
                  )}
                </nav>
              )}
            </div>
            {mapVisible && (
              <div className="hidden lg:block">
                <div className="sticky top-[152px] h-[calc(100vh-180px)]">
                  <DestinationsMap places={places} highlightId={highlightId} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile show-map drawer */}
      <button
        type="button"
        onClick={() => setMobileMapOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-button-md text-white shadow-airbnb lg:hidden"
      >
        <MapIcon className="h-4 w-4" />
        {t(dict, 'tours', 'list.showMap')}
      </button>
      {mobileMapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
            <span className="text-title-md text-ink">
              {t(dict, 'destinations', 'title')}
            </span>
            <button
              type="button"
              onClick={() => setMobileMapOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1">
            <DestinationsMap places={places} />
          </div>
        </div>
      )}
    </>
  );
}
