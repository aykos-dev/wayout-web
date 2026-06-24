'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { format, type Locale } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterSheet } from './filter-sheet';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface Props {
  dict: Dictionary;
  lang: Lang;
  total: number;
  onToggleMap: () => void;
  mapVisible: boolean;
}

const LOCALES = { uz: enUS, en: enUS, ru } satisfies Record<Lang, Locale>;

function parseCategories(sp: URLSearchParams): string[] {
  const multi = sp.getAll('categories');
  if (multi.length > 0) return multi.flatMap((v) => v.split(',')).filter(Boolean);
  const legacy = sp.get('category');
  return legacy ? [legacy] : [];
}

export function FilterBar({ dict, lang, total, onToggleMap, mapVisible }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const active = useMemo(
    () => ({
      categories: parseCategories(sp),
      difficulty: sp.get('difficulty'),
      duration: sp.get('duration'),
      q: sp.get('q'),
      priceMin: sp.get('priceMin'),
      priceMax: sp.get('priceMax'),
      dateFrom: sp.get('dateFrom'),
      dateTo: sp.get('dateTo'),
      onlyAvailable: sp.get('onlyAvailable'),
    }),
    [sp],
  );

  const replaceParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(sp.toString());
      mutate(next);
      router.push(`/tours${next.toString() ? `?${next.toString()}` : ''}`);
    },
    [router, sp],
  );

  const removeCategory = (c: string) => {
    track('tours_filter_change', { field: 'category', action: 'remove', value: c });
    replaceParams((next) => {
      next.delete('category');
      const rest = active.categories.filter((x) => x !== c);
      if (rest.length > 0) next.set('categories', rest.join(','));
      else next.delete('categories');
    });
  };

  const removeKey = (key: string) => {
    track('tours_filter_change', { field: key, action: 'remove' });
    replaceParams((next) => next.delete(key));
  };

  const removePriceRange = () => {
    track('tours_filter_change', { field: 'price', action: 'remove' });
    replaceParams((next) => {
      next.delete('priceMin');
      next.delete('priceMax');
    });
  };

  const removeDateRange = () => {
    track('tours_filter_change', { field: 'dates', action: 'remove' });
    replaceParams((next) => {
      next.delete('dateFrom');
      next.delete('dateTo');
    });
  };

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  for (const c of active.categories) {
    chips.push({
      key: `cat:${c}`,
      label: t(dict, 'tours', `categories.${c}`),
      onRemove: () => removeCategory(c),
    });
  }
  if (active.difficulty) {
    chips.push({
      key: 'difficulty',
      label: t(dict, 'tours', `difficulty.${active.difficulty}`),
      onRemove: () => removeKey('difficulty'),
    });
  }
  if (active.duration) {
    chips.push({
      key: 'duration',
      label: t(dict, 'tours', `filters.${active.duration}`),
      onRemove: () => removeKey('duration'),
    });
  }
  if (active.q) {
    chips.push({
      key: 'q',
      label: `"${active.q}"`,
      onRemove: () => removeKey('q'),
    });
  }
  if (active.priceMin || active.priceMax) {
    const min = active.priceMin ?? '0';
    const max = active.priceMax ?? '∞';
    chips.push({
      key: 'price',
      label: `${min} – ${max}`,
      onRemove: removePriceRange,
    });
  }
  if (active.dateFrom || active.dateTo) {
    const locale = LOCALES[lang];
    const fmt = (s: string | null) =>
      s ? format(new Date(`${s}T00:00:00`), 'LLL d', { locale }) : '…';
    chips.push({
      key: 'dates',
      label: `${fmt(active.dateFrom)} – ${fmt(active.dateTo)}`,
      onRemove: removeDateRange,
    });
  }
  if (active.onlyAvailable === 'true') {
    chips.push({
      key: 'onlyAvailable',
      label: t(dict, 'tours', 'filters.onlyAvailable'),
      onRemove: () => removeKey('onlyAvailable'),
    });
  }

  return (
    <div className="sticky top-20 z-20 border-b border-hairline bg-white">
      <div className="container-airbnb flex flex-wrap items-center gap-3 py-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            track('tours_filter_sheet_open', { active_chips: chips.length });
            setSheetOpen(true);
          }}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t(dict, 'tours', 'filters.title')}
          {chips.length > 0 && (
            <Badge variant="primary" className="ml-1">
              {chips.length}
            </Badge>
          )}
        </Button>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-soft px-3 py-1 text-body-sm text-ink hover:border-ink"
              >
                <span>{chip.label}</span>
                <X className="h-3.5 w-3.5 text-muted" />
              </button>
            ))}
          </div>
        )}

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
            onClick={() => {
              track('tours_view_mode_toggle', { mode: mapVisible ? 'list' : 'map' });
              onToggleMap();
            }}
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
        lang={lang}
        active={active}
      />
    </div>
  );
}
