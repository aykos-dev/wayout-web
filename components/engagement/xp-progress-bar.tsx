'use client';

import { motion } from 'framer-motion';

/**
 * Animated XP progress toward the next level. Shows the current total and the
 * remaining XP to level up (or "Max level" at the top band).
 */
export function XpProgressBar({
  xp,
  progressPct,
  nextLevelXp,
}: {
  xp: number;
  progressPct: number;
  nextLevelXp: number | null;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-caption">
        <span className="font-semibold text-ink">
          {xp.toLocaleString()} XP
        </span>
        <span className="text-muted">
          {nextLevelXp == null
            ? 'Max level'
            : `${(nextLevelXp - xp).toLocaleString()} XP to next level`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-strong">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
