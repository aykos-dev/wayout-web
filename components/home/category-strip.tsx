import Link from 'next/link';
import type { DestinationCategory } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

const ITEMS: { cat: DestinationCategory; emoji: string }[] = [
  { cat: 'waterfall', emoji: '💦' },
  { cat: 'peak', emoji: '⛰️' },
  { cat: 'lake', emoji: '🏞️' },
  { cat: 'canyon', emoji: '🏜️' },
  { cat: 'cave', emoji: '🕳️' },
];

export function CategoryStrip({ dict }: { dict: Dictionary }) {
  return (
    <nav className="border-y border-hairline-soft bg-white">
      <div className="container-airbnb flex gap-6 overflow-x-auto py-5 scroll-thin">
        {ITEMS.map(({ cat, emoji }) => (
          <Link
            key={cat}
            href={`/tours?category=${cat}`}
            className="group flex shrink-0 items-center gap-2 rounded-full bg-surface-strong px-4 py-2.5 text-ink transition-colors hover:bg-primary hover:text-white"
          >
            <span className="text-lg">{emoji}</span>
            <span className="text-caption font-semibold">
              {t(dict, 'tours', `categories.${cat}`)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
