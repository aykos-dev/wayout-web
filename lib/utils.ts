import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_FORMATS: Record<string, Intl.NumberFormatOptions> = {
  UZS: { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 },
  USD: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
  EUR: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
};

export function formatPrice(value: number | string, currency: string, lang = 'uz') {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return `${value} ${currency}`;
  try {
    return new Intl.NumberFormat(
      lang === 'uz' ? 'uz-Latn' : lang,
      CURRENCY_FORMATS[currency] ?? { style: 'currency', currency },
    ).format(num);
  } catch {
    return `${num.toLocaleString()} ${currency}`;
  }
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
