'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api-client';
import { UserAvatar } from '@/components/engagement/user-avatar';
import { LevelInfo } from '@/components/engagement/level-info';
import { BadgeIcon } from '@/components/engagement/badge-icon';
import { BadgeInfo } from '@/components/engagement/badge-info';
import { XpProgressBar } from '@/components/engagement/xp-progress-bar';

/** Public read-only profile for any user id. */
export function ProfileView({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => publicApi.profile(userId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-lg bg-surface-strong" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-muted">
        Profile not found.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-hairline bg-canvas p-6 text-center"
      >
        <div className="flex justify-center">
          <UserAvatar name={data.fullName} url={data.avatarUrl} size="xl" />
        </div>
        <h1 className="mt-3 text-display-md text-ink">
          {data.fullName ?? 'Anonymous Explorer'}
        </h1>
        <div className="mt-2 flex justify-center">
          <LevelInfo
            level={data.level}
            name={data.name}
            xp={data.xp}
            currentLevelXp={data.currentLevelXp}
            nextLevelXp={data.nextLevelXp}
          />
        </div>
        <div className="mt-5">
          <XpProgressBar
            xp={data.xp}
            progressPct={data.progressPct}
            nextLevelXp={data.nextLevelXp}
          />
        </div>
      </motion.section>

      <section className="mt-8">
        <h2 className="mb-4 text-display-sm text-ink">
          Badges{' '}
          <span className="text-muted">({data.badges.length})</span>
        </h2>
        {data.badges.length === 0 ? (
          <p className="text-body-sm text-muted">No badges earned yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {data.badges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <BadgeInfo
                  id={b.id}
                  name={b.name}
                  description={b.description}
                  tier={b.tier}
                  earnedAt={b.earnedAt}
                >
                  <BadgeIcon badgeId={b.id} tier={b.tier} size="lg" />
                </BadgeInfo>
                <span className="text-caption-sm font-medium text-ink">
                  {b.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
