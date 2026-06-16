'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { DestinationCategory, TourDifficulty } from '@/lib/types';

const CATEGORIES: DestinationCategory[] = [
  'waterfall',
  'peak',
  'lake',
  'canyon',
  'cave',
];
const DIFFICULTIES: TourDifficulty[] = ['easy', 'moderate', 'hard', 'extreme'];

interface Props {
  open: boolean;
  onClose: () => void;
  dict: Dictionary;
  active: {
    category?: string | null;
    difficulty?: string | null;
    duration?: string | null;
    q?: string | null;
    priceMin?: string | null;
    priceMax?: string | null;
    onlyAvailable?: string | null;
  };
  durationMap: Record<string, number | undefined>;
}

export function FilterSheet({ open, onClose, dict, active }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [draft, setDraft] = useState({
    category: active.category ?? '',
    difficulty: active.difficulty ?? '',
    q: active.q ?? '',
    priceMin: active.priceMin ?? '',
    priceMax: active.priceMax ?? '',
    onlyAvailable: active.onlyAvailable === 'true',
  });

  const apply = () => {
    const next = new URLSearchParams(sp.toString());
    const { onlyAvailable, ...stringFields } = draft;
    for (const [k, v] of Object.entries(stringFields)) {
      if (!v) next.delete(k);
      else next.set(k, String(v));
    }
    if (onlyAvailable) next.set('onlyAvailable', 'true');
    else next.delete('onlyAvailable');
    router.push(`/tours?${next.toString()}`);
    onClose();
  };

  const reset = () => {
    setDraft({ category: '', difficulty: '', q: '', priceMin: '', priceMax: '', onlyAvailable: false });
    router.push('/tours');
    onClose();
  };

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
                  active={draft.category === c}
                  onClick={() =>
                    setDraft((d) => ({ ...d, category: d.category === c ? '' : c }))
                  }
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

          <FieldGroup label={t(dict, 'tours', 'filters.priceRange')}>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder="Min"
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
                placeholder="Max"
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
