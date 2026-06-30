'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { publicApi } from '@/lib/api-client';
import { LeaderboardRow } from './leaderboard-row';

export function LeaderboardClient() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['leaderboard'],
      queryFn: ({ pageParam }) => publicApi.leaderboard(pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const sentinel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const entries = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-active">
          <Trophy className="size-7" />
        </span>
        <h1 className="mt-3 text-display-xl text-ink">Top Travelers</h1>
        <p className="mt-1 text-body-md text-muted">
          The most active explorers on Outway — ranked by XP and badges earned...
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-md bg-surface-strong"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-16 text-center text-body-md text-muted">
          No travelers on the board yet — be the first to earn XP!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={i + 1}
              index={i}
            />
          ))}
        </div>
      )}

      <div ref={sentinel} className="h-10" />
      {isFetchingNextPage && (
        <p className="py-4 text-center text-caption text-muted">Loading more…</p>
      )}
    </main>
  );
}
