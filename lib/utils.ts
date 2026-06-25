import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Thousands separator per language. */
const GROUP_SEP: Record<string, string> = { uz: ' ', ru: ' ', en: ',' };
/** Localized label for UZS (the only suffix currency we serve). */
const UZS_LABEL: Record<string, string> = { uz: "so'm", ru: 'сум', en: 'UZS' };

/**
 * Formats a price deterministically — the SAME output in Node (SSR) and the
 * browser, regardless of their ICU data. We deliberately avoid
 * `Intl.NumberFormat` with locale-specific currency display (e.g. 'uz-Latn'),
 * which renders differently across environments and caused hydration mismatches.
 */
export function formatPrice(value: number | string, currency: string, lang = 'uz') {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return `${value} ${currency}`;
  const rounded = Math.round(num);
  const sep = GROUP_SEP[lang] ?? ' ';
  // Pure string grouping — no Intl, so server and client always agree.
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const sign = rounded < 0 ? '-' : '';
  if (currency === 'USD') return `${sign}$${grouped}`;
  if (currency === 'EUR') return `${sign}€${grouped}`;
  if (currency === 'UZS') return `${sign}${grouped} ${UZS_LABEL[lang] ?? "so'm"}`;
  return `${sign}${grouped} ${currency}`;
}

export function durationDays(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export function durationLabel(days: number, lang: 'uz' | 'en' | 'ru'): string {
  const dict = {
    uz: {
      half: 'Yarim kun',
      day: 'Bir kun',
      multi: (d: number) => `${d} kun`,
    },
    en: {
      half: 'Half-day',
      day: 'Full day',
      multi: (d: number) => `${d} days`,
    },
    ru: {
      half: 'Полдня',
      day: '1 день',
      multi: (d: number) => `${d} дней`,
    },
  } as const;
  if (days < 1) return dict[lang].half;
  if (days === 1) return dict[lang].day;
  return dict[lang].multi(days);
}
