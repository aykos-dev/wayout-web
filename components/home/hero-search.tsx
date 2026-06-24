'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DestinationCategory, TourDifficulty } from '@/lib/types';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

const CATEGORIES: { cat: DestinationCategory; emoji: string }[] = [
  { cat: 'waterfall', emoji: '💦' },
  { cat: 'peak', emoji: '⛰️' },
  { cat: 'lake', emoji: '🏞️' },
  { cat: 'canyon', emoji: '🏜️' },
  { cat: 'cave', emoji: '🕳️' },
];
const WHENS = ['anytime', 'oneDay', 'multiDay'] as const;
type WhenKey = (typeof WHENS)[number];
const DIFFICULTIES: TourDifficulty[] = ['easy', 'moderate', 'hard', 'extreme'];

type FieldKey = 'where' | 'when' | 'vibe';

interface SearchState {
  q: string;
  category: DestinationCategory | '';
  when: WhenKey;
  difficulty: TourDifficulty | '';
}

const INITIAL: SearchState = {
  q: '',
  category: '',
  when: 'anytime',
  difficulty: '',
};

function buildHref(s: SearchState): string {
  const sp = new URLSearchParams();
  if (s.q.trim()) sp.set('q', s.q.trim());
  if (s.category) sp.set('category', s.category);
  if (s.when !== 'anytime') sp.set('duration', s.when);
  if (s.difficulty) sp.set('difficulty', s.difficulty);
  const qs = sp.toString();
  return qs ? `/tours?${qs}` : '/tours';
}

export function HeroSearch({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [state, setState] = useState<SearchState>(INITIAL);
  const [open, setOpen] = useState<FieldKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const set = <K extends keyof SearchState>(key: K, value: SearchState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const submit = () => {
    track('home_hero_search_submit', {
      q: state.q.trim() || undefined,
      category: state.category || undefined,
      when: state.when,
      difficulty: state.difficulty || undefined,
    });
    router.push(buildHref(state));
    setOpen(null);
    setMobileOpen(false);
  };

  const reset = () => setState(INITIAL);

  const whereLabel = state.category
    ? t(dict, 'tours', `categories.${state.category}`)
    : state.q.trim() || t(dict, 'common', 'search.placeholder');
  const whenLabel =
    state.when === 'anytime'
      ? t(dict, 'common', 'search.anytime')
      : t(dict, 'tours', `filters.${state.when}`);
  const vibeLabel = state.difficulty
    ? t(dict, 'tours', `difficulty.${state.difficulty}`)
    : t(dict, 'common', 'search.any');

  const hasWhere = Boolean(state.category || state.q.trim());
  const hasWhen = state.when !== 'anytime';
  const hasVibe = Boolean(state.difficulty);
  const anyFilter = hasWhere || hasWhen || hasVibe;

  return (
    <section className="container-airbnb py-8 sm:py-12">
      <h1 className="text-display-xl text-ink">
        {t(dict, 'tours', 'home.hero')}
      </h1>
      <p className="mt-2 max-w-xl text-body-md text-muted">
        {t(dict, 'tours', 'home.sub')}
      </p>

      {/* Desktop search bar */}
      <div
        className={cn(
          'mt-6 hidden max-w-3xl items-stretch rounded-full border border-hairline bg-white p-2 shadow-airbnb sm:flex',
          'transition-shadow hover:shadow-lg',
        )}
        role="search"
      >
        <Popover
          open={open === 'where'}
          onOpenChange={(o) => setOpen(o ? 'where' : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft',
                open === 'where' && 'bg-surface-soft',
              )}
            >
              <FieldLabel
                label={t(dict, 'common', 'search.where')}
                value={whereLabel}
                placeholder={t(dict, 'common', 'search.placeholder')}
                active={hasWhere}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <WherePanel
              dict={dict}
              q={state.q}
              category={state.category}
              onQ={(v) => set('q', v)}
              onCategory={(c) => {
                set('category', c);
                set('q', '');
                setOpen('when');
              }}
              onClear={() => {
                set('q', '');
                set('category', '');
              }}
              onSubmit={submit}
            />
          </PopoverContent>
        </Popover>

        <Divider />

        <Popover
          open={open === 'when'}
          onOpenChange={(o) => setOpen(o ? 'when' : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft',
                open === 'when' && 'bg-surface-soft',
              )}
            >
              <FieldLabel
                label={t(dict, 'common', 'search.when')}
                value={whenLabel}
                active={hasWhen}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center">
            <WhenPanel
              dict={dict}
              value={state.when}
              onChange={(w) => {
                set('when', w);
                setOpen('vibe');
              }}
            />
          </PopoverContent>
        </Popover>

        <Divider />

        <Popover
          open={open === 'vibe'}
          onOpenChange={(o) => setOpen(o ? 'vibe' : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft',
                open === 'vibe' && 'bg-surface-soft',
              )}
            >
              <FieldLabel
                label={t(dict, 'common', 'search.vibe')}
                value={vibeLabel}
                active={hasVibe}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <VibePanel
              dict={dict}
              value={state.difficulty}
              onChange={(d) => {
                set('difficulty', d);
                setOpen(null);
              }}
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={submit}
          aria-label={t(dict, 'common', 'search.submit')}
          className="ml-2 inline-flex h-12 shrink-0 items-center gap-2 self-center rounded-full bg-primary px-5 font-medium text-white transition-colors hover:bg-primary-active"
        >
          <Search className="h-5 w-5" />
          <span className="text-button-md">
            {t(dict, 'common', 'search.submit')}
          </span>
        </button>
      </div>

      {/* Mobile search trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mt-6 flex h-14 w-full max-w-3xl items-center gap-3 rounded-full border border-hairline bg-white px-5 text-left shadow-airbnb transition-shadow hover:shadow-lg sm:hidden"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Search className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate">
          <span className="block text-caption font-semibold text-ink">
            {anyFilter
              ? whereLabel
              : t(dict, 'common', 'search.tapToSearch')}
          </span>
          <span className="block truncate text-body-sm text-muted">
            {anyFilter
              ? [hasWhen ? whenLabel : null, hasVibe ? vibeLabel : null]
                  .filter(Boolean)
                  .join(' · ') ||
                t(dict, 'common', 'search.placeholder')
              : `${t(dict, 'common', 'search.anytime')} · ${t(dict, 'common', 'search.any')}`}
          </span>
        </span>
      </button>

      <QuickSearches
        dict={dict}
        onPick={(href, key) => {
          track('home_quick_search_click', { key, href });
          router.push(href);
        }}
      />

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="sm:hidden">
          <h2 className="text-display-sm">
            {t(dict, 'common', 'search.tapToSearch')}
          </h2>
          <div className="mt-6 space-y-6">
            <MobileSection title={t(dict, 'common', 'search.where')}>
              <WherePanel
                dict={dict}
                q={state.q}
                category={state.category}
                onQ={(v) => set('q', v)}
                onCategory={(c) => {
                  set('category', c);
                  set('q', '');
                }}
                onClear={() => {
                  set('q', '');
                  set('category', '');
                }}
                onSubmit={submit}
                compact
              />
            </MobileSection>
            <MobileSection title={t(dict, 'common', 'search.when')}>
              <WhenPanel
                dict={dict}
                value={state.when}
                onChange={(w) => set('when', w)}
                compact
              />
            </MobileSection>
            <MobileSection title={t(dict, 'common', 'search.vibe')}>
              <VibePanel
                dict={dict}
                value={state.difficulty}
                onChange={(d) => set('difficulty', d)}
                compact
              />
            </MobileSection>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <Button variant="link" onClick={reset}>
              {t(dict, 'tours', 'filters.reset')}
            </Button>
            <Button onClick={submit}>
              <Search className="mr-2 h-4 w-4" />
              {t(dict, 'common', 'search.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Divider() {
  return <div className="my-2 w-px self-stretch bg-hairline" />;
}

function FieldLabel({
  label,
  value,
  placeholder,
  active,
}: {
  label: string;
  value: string;
  placeholder?: string;
  active: boolean;
}) {
  return (
    <div className="truncate">
      <p className="text-caption font-semibold text-ink">{label}</p>
      <p
        className={cn(
          'truncate text-body-sm',
          active ? 'text-ink' : 'text-muted',
        )}
      >
        {value || placeholder || '—'}
      </p>
    </div>
  );
}

function WherePanel({
  dict,
  q,
  category,
  onQ,
  onCategory,
  onClear,
  onSubmit,
  compact,
}: {
  dict: Dictionary;
  q: string;
  category: DestinationCategory | '';
  onQ: (v: string) => void;
  onCategory: (c: DestinationCategory | '') => void;
  onClear: () => void;
  onSubmit: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'space-y-4'}>
      {!compact && (
        <p className="text-title-sm text-ink">
          {t(dict, 'common', 'search.destinationPrompt')}
        </p>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            onQ(e.target.value);
            if (category) onCategory('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={t(dict, 'common', 'search.placeholder')}
          className="h-11 w-full rounded-full border border-hairline bg-white pl-10 pr-10 mb-2 text-body-md outline-none focus:border-ink"
        />
        {(q || category) && (
          <button
            type="button"
            onClick={onClear}
            aria-label={t(dict, 'common', 'search.clear')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:bg-surface-soft hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className={cn('flex flex-wrap gap-2', !compact && 'pt-1')}>
        {CATEGORIES.map(({ cat, emoji }) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategory(active ? '' : cat)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-hairline text-ink hover:border-primary',
              )}
            >
              <span>{emoji}</span>
              <span>{t(dict, 'tours', `categories.${cat}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WhenPanel({
  dict,
  value,
  onChange,
  compact,
}: {
  dict: Dictionary;
  value: WhenKey;
  onChange: (v: WhenKey) => void;
  compact?: boolean;
}) {
  const labelFor = (w: WhenKey) =>
    w === 'anytime'
      ? t(dict, 'common', 'search.anytime')
      : t(dict, 'tours', `filters.${w}`);
  return (
    <div className={compact ? '' : 'space-y-4'}>
      {!compact && (
        <p className="text-title-sm text-ink">
          {t(dict, 'common', 'search.whenPrompt')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {WHENS.map((w) => {
          const active = value === w;
          return (
            <button
              key={w}
              type="button"
              onClick={() => onChange(w)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-hairline text-ink hover:border-primary',
              )}
            >
              {labelFor(w)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VibePanel({
  dict,
  value,
  onChange,
  compact,
}: {
  dict: Dictionary;
  value: TourDifficulty | '';
  onChange: (v: TourDifficulty | '') => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'space-y-4'}>
      {!compact && (
        <p className="text-title-sm text-ink">
          {t(dict, 'common', 'search.vibePrompt')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange('')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-body-sm transition-colors',
            value === ''
              ? 'border-primary bg-primary text-white'
              : 'border-hairline text-ink hover:border-primary',
          )}
        >
          {t(dict, 'common', 'search.any')}
        </button>
        {DIFFICULTIES.map((d) => {
          const active = value === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(active ? '' : d)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-hairline text-ink hover:border-primary',
              )}
            >
              {t(dict, 'tours', `difficulty.${d}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-title-sm text-ink">{title}</p>
      {children}
    </div>
  );
}

function QuickSearches({
  dict,
  onPick,
}: {
  dict: Dictionary;
  onPick: (href: string, key: string) => void;
}) {
  const items: { key: string; href: string }[] = [
    {
      key: 'weekendPeaks',
      href: buildHref({
        q: '',
        category: 'peak',
        when: 'multiDay',
        difficulty: '',
      }),
    },
    {
      key: 'easyDayTrips',
      href: buildHref({
        q: '',
        category: '',
        when: 'oneDay',
        difficulty: 'easy',
      }),
    },
    {
      key: 'waterfalls',
      href: buildHref({
        q: '',
        category: 'waterfall',
        when: 'anytime',
        difficulty: '',
      }),
    },
    {
      key: 'lakes',
      href: buildHref({
        q: '',
        category: 'lake',
        when: 'anytime',
        difficulty: '',
      }),
    },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-caption text-muted">
        {t(dict, 'common', 'search.quickSearches')}:
      </span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onPick(item.href, item.key)}
          className="rounded-full border border-hairline bg-white px-3 py-1.5 text-body-sm text-ink transition-colors hover:border-ink"
        >
          {t(dict, 'tours', `home.quick.${item.key}`)}
        </button>
      ))}
    </div>
  );
}
