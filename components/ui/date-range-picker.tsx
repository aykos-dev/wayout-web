'use client';

import * as React from 'react';
import { CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { format, type Locale } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export type { DateRange };

type Lang = 'uz' | 'en' | 'ru';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  clearLabel?: string;
  lang?: Lang;
  numberOfMonths?: 1 | 2;
  align?: 'start' | 'center' | 'end';
  disabled?: { before: Date };
  className?: string;
}

const LOCALE_MAP = { uz: enUS, en: enUS, ru } satisfies Record<
  Lang,
  Locale
>;

function formatRange(value: DateRange | undefined, locale: Locale): string {
  if (!value?.from) return '';
  const from = format(value.from, 'LLL d', { locale });
  if (!value.to) return from;
  // Same year → "Jul 14 – Aug 2"; cross-year → "Dec 28, 2026 – Jan 4, 2027"
  if (value.from.getFullYear() !== value.to.getFullYear()) {
    return `${format(value.from, 'LLL d, y', { locale })} – ${format(
      value.to,
      'LLL d, y',
      { locale },
    )}`;
  }
  return `${from} – ${format(value.to, 'LLL d', { locale })}`;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Add dates',
  clearLabel = 'Clear',
  lang = 'en',
  numberOfMonths = 2,
  align = 'start',
  disabled,
  className,
}: DateRangePickerProps) {
  const locale = LOCALE_MAP[lang];
  const hasValue = Boolean(value?.from);
  const label = hasValue ? formatRange(value, locale) : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-12 w-full items-center justify-between gap-2 rounded-full border border-hairline bg-white px-4 text-left text-body-md transition-colors',
            'hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
            hasValue ? 'text-ink' : 'text-muted',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{label}</span>
          </span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(undefined);
                }
              }}
              aria-label={clearLabel}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={numberOfMonths}
          locale={locale}
          disabled={disabled}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
