'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterSheet } from './filter-sheet';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface Props {
  dict: Dictionary;
  total: number;
  onToggleMap: () => void;
  mapVisible: boolean;
}

const DURATION_OPTIONS = ['halfDay', 'fullDay', 'multiDay'] as const;
type Duration = (typeof DURATION_OPTIONS)[number];

const DURATION_TO_DAYS: Record<Duration, number | undefined> = {
  halfDay: 1,
  fullDay: 1,
  multiDay: undefined,
};

export function FilterBar({ dict, total, onToggleMap, mapVisible }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const active = {
    category: sp.get('category'),
    difficulty: sp.get('difficulty'),
    duration: sp.get('duration') as Duration | null,
    q: sp.get('q'),
    priceMin: sp.get('priceMin'),
    priceMax: sp.get('priceMax'),
    onlyAvailable: sp.get('onlyAvailable'),
  };

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      router.push(`/tours?${next.toString()}`);
    },
    [router, sp],
  );

  const activeCount = Object.values(active).filter(Boolean).length;

  return (
    <div className="sticky top-20 z-20 border-b border-hairline bg-white">
      <div className="container-airbnb flex flex-wrap items-center gap-3 py-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t(dict, 'tours', 'filters.title')}
          {activeCount > 0 && (
            <Badge variant="primary" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>

        <div className="hidden gap-2 sm:flex">
          {DURATION_OPTIONS.map((d) => {
            const isActive = active.duration === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() =>
                  update({ duration: isActive ? undefined : d })
                }
                className={
                  'rounded-full border px-3 py-1.5 text-body-sm transition-colors ' +
                  (isActive
                    ? 'border-primary bg-primary text-white'
                    : 'border-hairline text-ink hover:border-primary')
                }
              >
                {t(dict, 'tours', `filters.${d}`)}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3 text-body-sm text-muted">
          <span>
            {t(dict, 'tours', 'list.results').replace(
              '{{count}}',
              String(total),
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMap}
            className="hidden md:inline-flex"
          >
            {mapVisible
              ? t(dict, 'tours', 'list.hideMap')
              : t(dict, 'tours', 'list.showMap')}
          </Button>
        </div>
      </div>
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        dict={dict}
        active={active}
        durationMap={DURATION_TO_DAYS}
      />
    </div>
  );
}
