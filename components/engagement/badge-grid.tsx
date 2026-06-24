'use client';

import { motion } from 'framer-motion';
import type { MyBadge } from '@/lib/api-client';
import { BadgeIcon } from './badge-icon';
import { cn } from '@/lib/utils';

/**
 * Responsive badge grid with staggered entrance. Earned badges are full-color;
 * locked ones show a progress hint (e.g. 2/3).
 */
export function BadgeGrid({ badges }: { badges: MyBadge[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {badges.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <BadgeIcon
            badgeId={b.id}
            tier={b.tier}
            earned={b.earned}
            size="lg"
          />
          <span
            className={cn(
              'text-caption-sm font-medium',
              b.earned ? 'text-ink' : 'text-muted',
            )}
          >
            {b.name}
          </span>
          {!b.earned && (
            <span className="text-[11px] tabular-nums text-muted-soft">
              {b.progress}/{b.target}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
