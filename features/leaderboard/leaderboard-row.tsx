'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/api-client';
import { BadgeIcon } from '@/components/engagement/badge-icon';
import { LevelBadge } from '@/components/engagement/level-badge';
import { cn } from '@/lib/utils';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? 'Traveler'}
        className="size-12 rounded-full object-cover"
      />
    );
  }
  const initials = (name ?? 'Explorer')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-title-sm font-semibold text-primary-active">
      {initials}
    </span>
  );
}

export function LeaderboardRow({
  entry,
  rank,
  index,
}: {
  entry: LeaderboardEntry;
  rank: number;
  index: number;
}) {
  const top3 = rank <= 3;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35, ease: 'easeOut' }}
    >
      <Link
        href={`/profile/${entry.id}`}
        className={cn(
          'flex items-center gap-4 rounded-md border px-4 py-3 transition hover:shadow-airbnb',
          top3 ? 'border-primary/30 bg-surface-soft' : 'border-hairline bg-canvas',
        )}
      >
        <span
          className={cn(
            'w-8 shrink-0 text-center text-title-md tabular-nums',
            top3 ? 'text-xl' : 'text-muted',
          )}
        >
          {MEDAL[rank] ?? rank}
        </span>

        <Avatar name={entry.fullName} url={entry.avatarUrl} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-body-md font-semibold text-ink">
            {entry.fullName ?? 'Anonymous Explorer'}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <LevelBadge level={entry.level} name={entry.name} />
            <span className="text-caption-sm tabular-nums text-muted">
              {entry.xp.toLocaleString()} XP
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 items-center -space-x-1.5 sm:flex">
          {entry.badgeIds.slice(0, 5).map((id) => (
            <BadgeIcon key={id} badgeId={id} size="sm" />
          ))}
          {entry.badgeIds.length > 5 && (
            <span className="pl-2 text-caption-sm text-muted">
              +{entry.badgeIds.length - 5}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
