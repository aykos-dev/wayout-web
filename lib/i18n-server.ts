import { cookies } from 'next/headers';
import { DEFAULT_LANG, SUPPORTED, type Lang } from './i18n';

export function getLangFromCookies(): Lang {
  const c = cookies().get('booktrip.lang')?.value;
  if (c && SUPPORTED.includes(c as Lang)) return c as Lang;
  return DEFAULT_LANG;
}
