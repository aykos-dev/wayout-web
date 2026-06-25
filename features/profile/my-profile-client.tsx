'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth, getStoredToken } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { UserAvatar } from '@/components/engagement/user-avatar';
import { LevelInfo } from '@/components/engagement/level-info';
import { XpProgressBar } from '@/components/engagement/xp-progress-bar';
import { BadgeGrid } from '@/components/engagement/badge-grid';
import { BadgeShareButton } from '@/components/engagement/badge-share-button';
import { Button } from '@/components/ui/button';

export function MyProfileClient() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Avoid a spurious login sheet before auth hydrates from localStorage.
    if (!auth.token && !getStoredToken()) {
      void auth.requestLogin().catch(() => router.push('/'));
    }
  }, [auth, router]);

  const xp = useQuery({
    queryKey: ['my-xp'],
    queryFn: () => userApi.getMyXp(),
    enabled: !!auth.token,
  });
  const badges = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => userApi.getMyBadges(),
    enabled: !!auth.token,
  });

  if (!auth.token || xp.isLoading || !xp.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-lg bg-surface-strong" />
      </div>
    );
  }

  const earned = badges.data?.filter((b) => b.earned).length ?? 0;

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-hairline bg-canvas p-6 text-center"
      >
        <div className="flex justify-center">
          <UserAvatar
            name={auth.user?.fullName ?? null}
            url={auth.user?.avatarUrl ?? null}
            size="xl"
          />
        </div>
        <h1 className="mt-3 text-display-md text-ink">
          {auth.user?.fullName ?? 'You'}
        </h1>
        <div className="mt-2 flex justify-center">
          <LevelInfo
            level={xp.data.level}
            name={xp.data.name}
            xp={xp.data.xp}
            currentLevelXp={xp.data.currentLevelXp}
            nextLevelXp={xp.data.nextLevelXp}
          />
        </div>
        <div className="mt-5">
          <XpProgressBar
            xp={xp.data.xp}
            progressPct={xp.data.progressPct}
            nextLevelXp={xp.data.nextLevelXp}
          />
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/leaderboard">
            <Button variant="secondary" size="sm">
              View leaderboard
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="secondary" size="sm">
              Edit profile
            </Button>
          </Link>
          {auth.user && <BadgeShareButton userId={auth.user.id} />}
        </div>
      </motion.section>

      <section className="mt-8">
        <h2 className="text-display-sm text-ink">
          Badges <span className="text-muted">({earned}/{badges.data?.length ?? 0})</span>
        </h2>
        <p className="mb-4 mt-0.5 text-caption-sm text-muted">
          Tap a badge to see what it means and how to earn it.
        </p>
        {badges.data && <BadgeGrid badges={badges.data} />}
      </section>
    </main>
  );
}
