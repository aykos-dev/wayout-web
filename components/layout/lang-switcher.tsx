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
import { LANG_LABELS, setLanguage } from '@/lib/set-language';

const LABELS = LANG_LABELS;

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
            onClick={() => setLanguage(l, current)}
            className={l === current ? 'font-semibold' : ''}
          >
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
