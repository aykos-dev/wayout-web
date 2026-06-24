import type { Metadata } from 'next';
import { LeaderboardClient } from '@/features/leaderboard/leaderboard-client';

export const metadata: Metadata = {
  title: 'Top Travelers · Outway',
  description:
    'The most active explorers on Outway — ranked by XP, badges and adventures.',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
