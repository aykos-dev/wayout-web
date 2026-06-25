'use client';

import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { usePreferences } from '@/lib/preferences';
import type { DestinationCategory } from '@/lib/types';
import { SettingGroup } from '@/components/settings/setting-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

const CATEGORIES: { key: DestinationCategory; label: string; emoji: string }[] = [
  { key: 'waterfall', label: 'Waterfall', emoji: '💦' },
  { key: 'peak', label: 'Peak', emoji: '⛰️' },
  { key: 'lake', label: 'Lake', emoji: '🏞️' },
  { key: 'canyon', label: 'Canyon', emoji: '🏜️' },
  { key: 'cave', label: 'Cave', emoji: '🕳️' },
];

// Most tours fall between 100k and 2M UZS — bound the slider to that range.
const BUDGET_MIN = 100_000;
const BUDGET_MAX = 2_000_000;
const BUDGET_STEP = 50_000;

const fmt = (n: number) => `${(n / 1000).toLocaleString()}k`;

/** Client-local browse preferences (categories + budget), persisted to localStorage. */
export function PreferencesSection() {
  const prefs = usePreferences();

  useEffect(() => {
    prefs.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCategory(cat: DestinationCategory) {
    const next = prefs.categories.includes(cat)
      ? prefs.categories.filter((c) => c !== cat)
      : [...prefs.categories, cat];
    track('preferences_categories_update', { categories: next });
    prefs.setCategories(next);
  }

  // Clamp the stored value into range; treat unset/out-of-range as "max".
  const budget =
    prefs.maxBudget >= BUDGET_MIN ? Math.min(prefs.maxBudget, BUDGET_MAX) : BUDGET_MAX;

  return (
    <>
      <SettingGroup
        title="Interests"
        description="Pick the destination types you love — we’ll prioritize them for you."
      >
        <div className="flex flex-wrap gap-2 px-4 py-4">
          {CATEGORIES.map(({ key, label, emoji }) => {
            const active = prefs.categories.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCategory(key)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-body-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary-soft text-primary-active'
                    : 'border-hairline bg-white text-ink hover:border-primary hover:bg-surface-soft',
                )}
              >
                <span aria-hidden className="text-[15px] leading-none">
                  {emoji}
                </span>
                {label}
                {active && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </SettingGroup>

      <SettingGroup title="Max budget">
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-body-sm text-muted">Up to</span>
            <span className="text-title-md text-ink">
              {budget.toLocaleString()}{' '}
              <span className="text-body-sm text-muted">UZS</span>
            </span>
          </div>
          <Slider
            aria-label="Max budget"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={[budget]}
            onValueChange={([v]) => prefs.setBudget(v)}
          />
          <div className="flex justify-between text-caption-sm text-muted-soft">
            <span>{fmt(BUDGET_MIN)}</span>
            <span>{fmt(BUDGET_MAX)}</span>
          </div>
        </div>
      </SettingGroup>
    </>
  );
}
