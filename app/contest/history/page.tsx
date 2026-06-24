import type { Metadata } from 'next';
import { ContestHistoryClient } from '@/features/contest/contest-history-client';

export const metadata: Metadata = {
  title: 'Photo Contest — Past Winners · Outway',
};

export default function ContestHistoryPage() {
  return <ContestHistoryClient />;
}
