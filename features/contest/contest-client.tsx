'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { publicApi, userApi } from '@/lib/api-client';
import { ContestHero } from './contest-hero';
import { ContestGallery } from './contest-gallery';
import { ContestSubmissionForm } from './contest-submission-form';
import { ContestLeaderboard } from './contest-leaderboard';

export function ContestClient() {
  const auth = useAuth();
  const [voted, setVoted] = useState<Set<string>>(new Set());
  // Local vote-count overrides layered on top of server data (optimistic).
  const [delta, setDelta] = useState<Record<string, number>>({});

  const current = useQuery({
    queryKey: ['contest', 'current'],
    queryFn: () => publicApi.contestCurrent(),
  });

  const entries = useInfiniteQuery({
    queryKey: ['contest', 'entries'],
    queryFn: ({ pageParam }) => publicApi.contestEntries(pageParam, 24),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: !!current.data,
  });

  const leaderboard = useQuery({
    queryKey: ['contest', 'leaderboard'],
    queryFn: () => publicApi.contestLeaderboard(),
    enabled: !!current.data,
  });

  useQuery({
    queryKey: ['contest', 'my-votes'],
    queryFn: async () => {
      const ids = await userApi.contestMyVotes();
      setVoted(new Set(ids));
      return ids;
    },
    enabled: !!auth.token && !!current.data,
  });

  const sentinel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && entries.hasNextPage && !entries.isFetchingNextPage) {
          void entries.fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [entries]);

  async function toggleVote(id: string, isVoted: boolean) {
    if (!auth.token) {
      void auth.requestLogin().catch(() => undefined);
      return;
    }
    // Optimistic update.
    setVoted((prev) => {
      const next = new Set(prev);
      if (isVoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (isVoted ? -1 : 1) }));
    try {
      if (isVoted) await userApi.contestUnvote(id);
      else await userApi.contestVote(id);
    } catch {
      // Revert on failure.
      setVoted((prev) => {
        const next = new Set(prev);
        if (isVoted) next.add(id);
        else next.delete(id);
        return next;
      });
      setDelta((d) => ({ ...d, [id]: (d[id] ?? 0) + (isVoted ? 1 : -1) }));
    }
  }

  if (current.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-52 animate-pulse rounded-lg bg-surface-strong" />
      </div>
    );
  }
  if (!current.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-display-md text-ink">No active contest</h1>
        <p className="mt-2 text-body-md text-muted">
          Check back soon — a new photo contest starts every month.
        </p>
        <Link href="/contest/history" className="mt-4 inline-block text-primary underline">
          See past winners →
        </Link>
      </div>
    );
  }

  const contest = current.data;
  const rawEntries = entries.data?.pages.flatMap((p) => p.items) ?? [];
  const items = rawEntries.map((e) => ({
    ...e,
    voteCount: e.voteCount + (delta[e.id] ?? 0),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <ContestHero contest={contest} />

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-display-sm text-ink">Entries</h2>
        <Link href="/contest/history" className="text-body-sm text-primary underline">
          Past winners →
        </Link>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {items.length === 0 ? (
            <p className="py-12 text-center text-body-md text-muted">
              No entries yet — be the first!
            </p>
          ) : (
            <ContestGallery
              entries={items}
              votedIds={voted}
              canVote={contest.status === 'voting'}
              onToggleVote={toggleVote}
            />
          )}
          <div ref={sentinel} className="h-10" />
        </div>

        <aside className="space-y-6">
          {contest.status === 'submissions' && (
            <ContestSubmissionForm
              onSubmitted={() => void entries.refetch()}
            />
          )}
          {leaderboard.data && <ContestLeaderboard entries={leaderboard.data} />}
        </aside>
      </div>
    </main>
  );
}
