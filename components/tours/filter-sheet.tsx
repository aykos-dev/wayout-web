'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { DestinationCategory, TourDifficulty } from '@/lib/types';
import { track } from '@/lib/analytics';

const CATEGORIES: DestinationCategory[] = [
  'waterfall',
  'peak',
  'lake',
  'canyon',
  'cave',
];
const DIFFICULTIES: TourDifficulty[] = ['easy', 'moderate', 'hard', 'extreme'];
const DURATIONS = ['oneDay', 'multiDay'] as const;
type DurationKey = (typeof DURATIONS)[number];

interface Props {
  open: boolean;
  onClose: () => void;
  dict: Dictionary;
  lang: Lang;
  active: {
    categories?: string[];
    difficulty?: string | null;
    duration?: string | null;
    q?: string | null;
    priceMin?: string | null;
    priceMax?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    onlyAvailable?: string | null;
  };
}

const parseISODate = (s: string | null | undefined): Date | undefined =>
  s ? new Date(`${s}T00:00:00`) : undefined;

const toISODate = (d: Date | undefined): string =>
  d ? format(d, 'yyyy-MM-dd') : '';

export function FilterSheet({ open, onClose, dict, lang, active }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [draft, setDraft] = useState({
    categories: active.categories ?? [],
    difficulty: active.difficulty ?? '',
    duration: (active.duration ?? '') as DurationKey | '',
    q: active.q ?? '',
    priceMin: active.priceMin ?? '',
    priceMax: active.priceMax ?? '',
    dateRange: {
      from: parseISODate(active.dateFrom),
      to: parseISODate(active.dateTo),
    } as DateRange,
    onlyAvailable: active.onlyAvailable === 'true',
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apply = () => {
    track('tours_filter_apply', {
      categories: draft.categories,
      difficulty: draft.difficulty || undefined,
      duration: draft.duration || undefined,
      q: draft.q || undefined,
      price_min: draft.priceMin || undefined,
      price_max: draft.priceMax || undefined,
      date_from: toISODate(draft.dateRange.from) || undefined,
      date_to: toISODate(draft.dateRange.to) || undefined,
      only_available: draft.onlyAvailable,
    });
    if (draft.q) {
      track('search', { search_term: draft.q });
    }
    const next = new URLSearchParams(sp.toString());
    next.delete('category');
    if (draft.categories.length > 0) next.set('categories', draft.categories.join(','));
    else next.delete('categories');
    if (draft.difficulty) next.set('difficulty', draft.difficulty);
    else next.delete('difficulty');
    if (draft.duration) next.set('duration', draft.duration);
    else next.delete('duration');
    if (draft.q) next.set('q', draft.q);
    else next.delete('q');
    if (draft.priceMin) next.set('priceMin', String(draft.priceMin));
    else next.delete('priceMin');
    if (draft.priceMax) next.set('priceMax', String(draft.priceMax));
    else next.delete('priceMax');
    const fromISO = toISODate(draft.dateRange.from);
    const toISO = toISODate(draft.dateRange.to);
    if (fromISO) next.set('dateFrom', fromISO);
    else next.delete('dateFrom');
    if (toISO) next.set('dateTo', toISO);
    else next.delete('dateTo');
    if (draft.onlyAvailable) next.set('onlyAvailable', 'true');
    else next.delete('onlyAvailable');
    router.push(`/tours?${next.toString()}`);
    onClose();
  };

  const reset = () => {
    track('tours_filter_reset');
    setDraft({
      categories: [],
      difficulty: '',
      duration: '',
      q: '',
      priceMin: '',
      priceMax: '',
      dateRange: { from: undefined, to: undefined } as DateRange,
      onlyAvailable: false,
    });
    router.push('/tours');
    onClose();
  };

  const toggleCategory = (c: string) =>
    setDraft((s) => ({
      ...s,
      categories: s.categories.includes(c)
        ? s.categories.filter((x) => x !== c)
        : [...s.categories, c],
    }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <h2 className="text-display-sm">{t(dict, 'tours', 'filters.title')}</h2>

        <div className="mt-6 space-y-6">
          <FieldGroup label={t(dict, 'tours', 'filters.categories')}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  active={draft.categories.includes(c)}
                  onClick={() => toggleCategory(c)}
                >
                  {t(dict, 'tours', `categories.${c}`)}
                </Chip>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label={t(dict, 'tours', 'filters.difficulty')}>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  active={draft.difficulty === d}
                  onClick={() =>
                    setDraft((s) => ({
                      ...s,
                      difficulty: s.difficulty === d ? '' : d,
                    }))
                  }
                >
                  {t(dict, 'tours', `difficulty.${d}`)}
                </Chip>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label={t(dict, 'tours', 'filters.duration')}>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip
                  key={d}
                  active={draft.duration === d}
                  onClick={() =>
                    setDraft((s) => ({
                      ...s,
                      duration: s.duration === d ? '' : d,
                    }))
                  }
                >
                  {t(dict, 'tours', `filters.${d}`)}
                </Chip>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label={t(dict, 'tours', 'filters.dates')}>
            <DateRangePicker
              value={draft.dateRange}
              onChange={(range) =>
                setDraft((s) => ({
                  ...s,
                  dateRange: range ?? { from: undefined, to: undefined },
                }))
              }
              placeholder={t(dict, 'tours', 'filters.datesPlaceholder')}
              clearLabel={t(dict, 'common', 'search.clear')}
              lang={lang}
              disabled={{ before: today }}
              align="start"
            />
          </FieldGroup>

          <FieldGroup label={t(dict, 'tours', 'filters.search')}>
            <input
              type="text"
              value={draft.q}
              onChange={(e) =>
                setDraft((s) => ({ ...s, q: e.target.value }))
              }
              className="h-12 w-full rounded-sm border border-hairline bg-white px-3 text-body-md outline-none focus:border-ink"
            />
          </FieldGroup>

          <FieldGroup label={t(dict, 'tours', 'filters.price')}>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder={t(dict, 'tours', 'filters.priceMin')}
                value={draft.priceMin}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, priceMin: e.target.value }))
                }
                className="h-12 w-full rounded-sm border border-hairline bg-white px-3 text-body-md outline-none focus:border-ink"
              />
              <span className="text-muted">&ndash;</span>
              <input
                type="number"
                min={0}
                placeholder={t(dict, 'tours', 'filters.priceMax')}
                value={draft.priceMax}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, priceMax: e.target.value }))
                }
                className="h-12 w-full rounded-sm border border-hairline bg-white px-3 text-body-md outline-none focus:border-ink"
              />
            </div>
          </FieldGroup>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.onlyAvailable}
              onChange={(e) =>
                setDraft((s) => ({ ...s, onlyAvailable: e.target.checked }))
              }
              className="h-5 w-5 rounded border-hairline accent-primary"
            />
            <span className="text-body-sm text-ink">
              {t(dict, 'tours', 'filters.onlyAvailable')}
            </span>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="link" onClick={reset}>
            {t(dict, 'tours', 'filters.reset')}
          </Button>
          <Button onClick={apply}>{t(dict, 'tours', 'filters.apply')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-title-sm text-ink">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1.5 text-body-sm transition-colors ' +
        (active
          ? 'border-primary bg-primary text-white'
          : 'border-hairline text-ink hover:border-primary')
      }
    >
      {children}
    </button>
  );
}
