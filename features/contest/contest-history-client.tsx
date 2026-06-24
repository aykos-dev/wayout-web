'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api-client';
import { absoluteMedia } from '@/lib/seo';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function ContestHistoryClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['contest', 'history'],
    queryFn: () => publicApi.contestHistory(),
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-display-xl text-ink">Past winners</h1>
        <Link href="/contest" className="text-body-sm text-primary underline">
          Current contest →
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-surface-strong" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="mt-12 text-center text-body-md text-muted">
          No past contests yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {data.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="overflow-hidden rounded-lg border border-hairline bg-canvas"
            >
              {m.winner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={absoluteMedia(m.winner.photoUrl) ?? m.winner.photoUrl}
                  alt={m.winner.caption ?? 'Winning photo'}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-surface-strong text-muted">
                  No winner
                </div>
              )}
              <div className="p-4">
                <p className="text-caption font-semibold uppercase tracking-wide text-primary-active">
                  {MONTHS[m.month - 1]} {m.year}
                </p>
                {m.winner?.caption && (
                  <p className="mt-1 text-body-md text-ink">{m.winner.caption}</p>
                )}
                {m.winner && (
                  <p className="mt-1 text-caption-sm text-muted">
                    🏆 {m.winner.voteCount} votes
                  </p>
                )}
                {m.prizeDescription && (
                  <p className="mt-2 text-caption-sm text-muted">
                    Prize: {m.prizeDescription}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </main>
  );
}
