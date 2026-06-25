'use client';

import type { Lang } from './i18n';
import { track } from './analytics';
import { getStoredToken } from './auth';
import { userApi } from './api-client';

export const LANG_LABELS: Record<Lang, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

/**
 * Switches the UI language: sets the `booktrip.lang` cookie, persists the
 * locale for signed-in users (so Telegram DMs follow it), then reloads so the
 * server re-renders with the new dictionary. Shared by the header switcher and
 * the Settings language row.
 */
export function setLanguage(lang: Lang, from?: Lang) {
  track('lang_change', { from, to: lang });
  document.cookie = `booktrip.lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
  const reload = () => window.location.reload();
  if (getStoredToken()) {
    void userApi.setLocale(lang).catch(() => undefined).finally(reload);
  } else {
    reload();
  }
}
