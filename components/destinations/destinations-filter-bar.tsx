'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface Props {
  dict: Dictionary;
  total: number;
  onToggleMap: () => void;
  mapVisible: boolean;
  regions: string[];
  categories: string[];
}

const DIFFICULTIES = ['easy', 'moderate', 'hard', 'extreme'] as const;

export function DestinationsFilterBar({
  dict,
  total,
  onToggleMap,
  mapVisible,
  regions,
  categories,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const region = sp.get('region') ?? '';
  const category = sp.get('category') ?? '';
  const difficulty = sp.get('difficulty') ?? '';
  const q = sp.get('q') ?? '';

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      // Resetting page on any filter change keeps results coherent.
      if (Object.keys(patch).some((k) => k !== 'page')) next.delete('page');
      const qs = next.toString();
      router.push(qs ? `/destinations?${qs}` : '/destinations');
    },
    [router, sp],
  );

  const [draft, setDraft] = useState(q);
  useEffect(() => setDraft(q), [q]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearch = (value: string) => {
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update({ q: value || undefined });
    }, 300);
  };

  const activeCount = [region, category, difficulty, q].filter(Boolean).length;
  const onClear = () => router.push('/destinations');

  const resultsLabel = t(dict, 'tours', 'list.results').replace(
    '{{count}}',
    String(total),
  );

  return (
    <div className="sticky top-20 z-20 border-b border-hairline bg-white">
      <div className="container-airbnb flex flex-wrap items-center gap-3 py-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={draft}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t(dict, 'common', 'search.placeholder')}
            className="h-10 w-full rounded-full border border-hairline bg-white pl-9 pr-3 text-body-sm outline-none focus:border-ink"
          />
        </div>

        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          <Pill
            value={region}
            onChange={(v) => update({ region: v || undefined })}
            placeholder={t(dict, 'destinations', 'filters.region')}
            options={regions}
          />
          <Pill
            value={category}
            onChange={(v) => update({ category: v || undefined })}
            placeholder={t(dict, 'destinations', 'filters.category')}
            options={categories}
          />
          <Pill
            value={difficulty}
            onChange={(v) => update({ difficulty: v || undefined })}
            placeholder={t(dict, 'destinations', 'filters.difficulty')}
            options={DIFFICULTIES.map((d) => d)}
            labelFor={(d) => t(dict, 'tours', `difficulty.${d}`)}
          />
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-body-sm text-muted underline-offset-2 hover:underline"
            >
              {t(dict, 'destinations', 'filters.clear')}
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 text-body-sm text-muted">
          <span>{resultsLabel}</span>
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
    </div>
  );
}

interface PillProps {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  options: string[];
  labelFor?: (raw: string) => string;
}

function Pill({ value, onChange, placeholder, options, labelFor }: PillProps) {
  // A bare <select> keeps the bundle small and is enough for v1 — Radix Select
  // isn't installed and adding a dep would violate the "no new dependencies"
  // contract.
  return (
    <label
      className={
        'inline-flex items-center rounded-full border px-3 py-1.5 text-body-sm transition-colors ' +
        (value
          ? 'border-primary bg-primary text-white'
          : 'border-hairline text-ink hover:border-primary')
      }
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent outline-none"
      >
        <option value="" className="text-ink">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-ink">
            {labelFor ? labelFor(opt) : opt}
          </option>
        ))}
      </select>
    </label>
  );
}
