'use client';

import type { ContestEntry } from '@/lib/api-client';
import { absoluteMedia } from '@/lib/seo';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function ContestLeaderboard({ entries }: { entries: ContestEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="rounded-md border border-hairline bg-canvas p-4">
      <h3 className="mb-3 text-title-md text-ink">Leaderboard</h3>
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={e.id} className="flex items-center gap-3">
            <span className="w-6 text-center text-body-sm tabular-nums text-muted">
              {MEDAL[i + 1] ?? i + 1}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absoluteMedia(e.photoUrl) ?? e.photoUrl}
              alt=""
              className="size-10 rounded object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-body-sm text-ink">
              {e.author.name ?? 'Anonymous'}
            </span>
            <span className="text-caption font-semibold tabular-nums text-primary-active">
              {e.voteCount}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
