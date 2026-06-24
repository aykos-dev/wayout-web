import type { Metadata } from 'next';
import { ContestClient } from '@/features/contest/contest-client';

export const metadata: Metadata = {
  title: 'Photo Contest · Outway',
  description:
    'Outway Snap — the monthly photo contest. Submit your best shots from the trail and vote for the community favorite.',
};

export default function ContestPage() {
  return <ContestClient />;
}
