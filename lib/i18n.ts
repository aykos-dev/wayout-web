import uzCommon from '@/messages/uz/common.json';
import uzTours from '@/messages/uz/tours.json';
import uzDestinations from '@/messages/uz/destinations.json';
import enCommon from '@/messages/en/common.json';
import enTours from '@/messages/en/tours.json';
import enDestinations from '@/messages/en/destinations.json';
import ruCommon from '@/messages/ru/common.json';
import ruTours from '@/messages/ru/tours.json';
import ruDestinations from '@/messages/ru/destinations.json';

export type Lang = 'uz' | 'en' | 'ru';
export const SUPPORTED: Lang[] = ['uz', 'en', 'ru'];
export const DEFAULT_LANG: Lang =
  (process.env.NEXT_PUBLIC_DEFAULT_LANG as Lang) ?? 'uz';

const DICTIONARIES = {
  uz: { common: uzCommon, tours: uzTours, destinations: uzDestinations },
  en: { common: enCommon, tours: enTours, destinations: enDestinations },
  ru: { common: ruCommon, tours: ruTours, destinations: ruDestinations },
} as const;

export type Dictionary = (typeof DICTIONARIES)[Lang];

export function getDict(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

export function t(
  dict: Dictionary,
  ns: keyof Dictionary,
  key: string,
): string {
  const ref = dict[ns] as Record<string, unknown>;
  return resolve(ref, key) ?? key;
}

function resolve(obj: Record<string, unknown>, path: string): string | null {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return null;
    }
  }
  return typeof cur === 'string' ? cur : null;
}
