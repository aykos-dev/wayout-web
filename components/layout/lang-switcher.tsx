'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED, type Lang } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { getStoredToken } from '@/lib/auth';
import { userApi } from '@/lib/api-client';

const LABELS: Record<Lang, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

function setLang(lang: Lang, from: Lang) {
  track('lang_change', { from, to: lang });
  document.cookie = `booktrip.lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
  const reload = () => window.location.reload();
  // Persist for signed-in users so their Telegram DMs follow the new language.
  if (getStoredToken()) {
    void userApi
      .setLocale(lang)
      .catch(() => undefined)
      .finally(reload);
  } else {
    reload();
  }
}

export function LangSwitcher({ current }: { current: Lang }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Language">
          <Globe className="mr-2 h-4 w-4" />
          {LABELS[current]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l, current)}
            className={l === current ? 'font-semibold' : ''}
          >
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
