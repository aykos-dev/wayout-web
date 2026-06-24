'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { publicApi } from '@/lib/api-client';
import { absoluteMedia } from '@/lib/seo';

/**
 * Homepage teaser for the monthly photo contest. Self-hides when there's no
 * active contest. Shows the current phase, time left and the top entry.
 */
export function ContestWidget() {
  const current = useQuery({
    queryKey: ['contest', 'current'],
    queryFn: () => publicApi.contestCurrent(),
  });
  const top = useQuery({
    queryKey: ['contest', 'leaderboard'],
    queryFn: () => publicApi.contestLeaderboard(),
    enabled: !!current.data,
  });

  const contest = current.data;
  if (!contest || contest.status === 'closed') return null;

  const hero = top.data?.[0];
  const phrase =
    contest.status === 'voting'
      ? `${contest.daysLeft} day${contest.daysLeft === 1 ? '' : 's'} left to vote`
      : `${contest.daysLeft} day${contest.daysLeft === 1 ? '' : 's'} left to enter`;

  return (
    <section className="container-airbnb py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/contest"
          className="flex items-center gap-4 overflow-hidden rounded-lg border border-hairline bg-surface-soft p-4 transition hover:shadow-airbnb"
        >
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={absoluteMedia(hero.photoUrl) ?? hero.photoUrl}
              alt=""
              className="size-20 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex size-20 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-active">
              <Camera className="size-8" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold uppercase tracking-wide text-primary-active">
              Photo Contest
            </p>
            <p className="text-title-md text-ink">Outway Snap — {phrase}</p>
            <p className="mt-0.5 text-body-sm text-muted">
              {contest.entryCount} entries · tap to {contest.status === 'voting' ? 'vote' : 'enter'} →
            </p>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
