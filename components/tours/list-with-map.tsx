'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { TourCard } from './tour-card';
import { FilterBar } from './filter-bar';

const ToursMap = dynamic(
  () => import('./tours-map').then((m) => m.ToursMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

function MapSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-md bg-surface-soft" />;
}

interface Props {
  tours: Tour[];
  lang: Lang;
  dict: Dictionary;
}

export function ListWithMap({ tours, lang, dict }: Props) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);

  return (
    <>
      <FilterBar
        dict={dict}
        total={tours.length}
        onToggleMap={() => setMapVisible((v) => !v)}
        mapVisible={mapVisible}
      />
      <div className="container-airbnb py-6">
        {tours.length === 0 ? (
          <p className="rounded-md border border-dashed border-hairline p-12 text-center text-body-md text-muted">
            {t(dict, 'tours', 'list.noResults')}
          </p>
        ) : (
          <div
            className={
              'grid gap-6 ' +
              (mapVisible
                ? 'lg:grid-cols-[1.4fr_1fr]'
                : 'grid-cols-1')
            }
          >
            <div
              className={
                'grid gap-x-6 gap-y-10 sm:grid-cols-2 ' +
                (mapVisible ? 'lg:grid-cols-2' : 'lg:grid-cols-4')
              }
            >
              {tours.map((tour, i) => (
                <div
                  key={tour.id}
                  onMouseEnter={() => setHighlightId(tour.id)}
                  onMouseLeave={() => setHighlightId(null)}
                >
                  <TourCard
                    tour={tour}
                    lang={lang}
                    dict={dict}
                    priority={i < 4}
                  />
                </div>
              ))}
            </div>
            {mapVisible && (
              <div className="hidden lg:block">
                <div className="sticky top-[152px] h-[calc(100vh-180px)]">
                  <ToursMap tours={tours} highlightId={highlightId} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
