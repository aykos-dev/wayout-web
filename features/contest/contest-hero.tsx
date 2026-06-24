'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import type { ContestCurrent } from '@/lib/api-client';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COPY: Record<ContestCurrent['status'], { label: string; hint: (d: number) => string }> = {
  submissions: {
    label: 'Submissions open',
    hint: (d) => `${d} day${d === 1 ? '' : 's'} left to enter`,
  },
  voting: {
    label: 'Voting open',
    hint: (d) => `${d} day${d === 1 ? '' : 's'} left to vote`,
  },
  closed: { label: 'Closed', hint: () => 'Winner announced' },
};

export function ContestHero({ contest }: { contest: ContestCurrent }) {
  const copy = STATUS_COPY[contest.status];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-lg bg-gradient-to-br from-primary-active to-primary p-8 text-white sm:p-10"
    >
      <div className="flex items-center gap-2 text-body-sm opacity-90">
        <Camera className="size-5" />
        Outway Snap · {MONTHS[contest.month - 1]} {contest.year}
      </div>
      <h1 className="mt-3 text-display-xl">Monthly Photo Contest</h1>
      <p className="mt-2 max-w-lg text-body-md opacity-90">
        Share your best shots from the trail. The community votes, and the
        winner takes the prize.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-caption font-semibold">
          {copy.label}
        </span>
        <span className="text-body-sm opacity-90">{copy.hint(contest.daysLeft)}</span>
        <span className="text-body-sm opacity-90">· {contest.entryCount} entries</span>
      </div>
      {contest.prizeDescription && (
        <div className="mt-5 rounded-md bg-white/15 px-4 py-3 text-body-sm">
          🏆 <span className="font-semibold">Prize:</span> {contest.prizeDescription}
        </div>
      )}
    </motion.section>
  );
}
