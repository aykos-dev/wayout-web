'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { ContestEntry } from '@/lib/api-client';
import { absoluteMedia } from '@/lib/seo';
import { cn } from '@/lib/utils';

export function ContestGallery({
  entries,
  votedIds,
  canVote,
  onToggleVote,
}: {
  entries: ContestEntry[];
  votedIds: Set<string>;
  canVote: boolean;
  onToggleVote: (id: string, voted: boolean) => void;
}) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {entries.map((e, i) => {
        const voted = votedIds.has(e.id);
        return (
          <motion.figure
            key={e.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ delay: Math.min((i % 12) * 0.03, 0.3), duration: 0.4 }}
            className="break-inside-avoid overflow-hidden rounded-md border border-hairline bg-canvas"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absoluteMedia(e.photoUrl) ?? e.photoUrl}
              alt={e.caption ?? 'Contest entry'}
              className="w-full object-cover"
            />
            <figcaption className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                {e.caption && (
                  <p className="truncate text-body-sm text-ink">{e.caption}</p>
                )}
                <p className="truncate text-caption-sm text-muted">
                  {e.author.name ?? 'Anonymous'}
                </p>
              </div>
              <button
                type="button"
                disabled={!canVote}
                onClick={() => onToggleVote(e.id, voted)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-semibold transition',
                  canVote ? 'cursor-pointer' : 'cursor-default',
                  voted
                    ? 'border-primary bg-primary-soft text-primary-active'
                    : 'border-hairline text-muted hover:border-primary',
                )}
                aria-pressed={voted}
              >
                <motion.span
                  key={voted ? 'on' : 'off'}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <Heart
                    className={cn('size-4', voted && 'fill-primary text-primary')}
                  />
                </motion.span>
                <span className="tabular-nums">{e.voteCount}</span>
              </button>
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}
