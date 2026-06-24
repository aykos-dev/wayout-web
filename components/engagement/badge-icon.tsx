import { cn } from '@/lib/utils';

/** Emoji + accent per badge id. Falls back to a generic medal. */
const BADGE_META: Record<string, string> = {
  first_steps: '👣',
  weekend_warrior: '🥾',
  weekend_warrior_ii: '🥾',
  peak_bagger: '⛰️',
  peak_bagger_ii: '⛰️',
  peak_bagger_iii: '🏔️',
  photo_pro: '📸',
  storyteller: '✍️',
  social_butterfly: '🦋',
  local_legend: '🏆',
  early_adopter: '🌱',
};

const TIER_RING: Record<number, string> = {
  1: 'ring-amber-700/40 bg-amber-50',
  2: 'ring-slate-400/50 bg-slate-50',
  3: 'ring-yellow-500/60 bg-yellow-50',
};

const SIZES = {
  sm: 'size-8 text-base',
  md: 'size-12 text-2xl',
  lg: 'size-16 text-3xl',
} as const;

export function BadgeIcon({
  badgeId,
  tier = 1,
  earned = true,
  size = 'md',
  className,
}: {
  badgeId: string;
  tier?: number;
  earned?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full ring-2 transition',
        SIZES[size],
        earned
          ? TIER_RING[tier] ?? TIER_RING[1]
          : 'bg-surface-strong ring-hairline grayscale',
        !earned && 'opacity-40',
        className,
      )}
    >
      {BADGE_META[badgeId] ?? '🏅'}
    </span>
  );
}
