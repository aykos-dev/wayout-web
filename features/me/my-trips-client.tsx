'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { TourGrid } from '@/components/tours/tour-grid';

interface InterestRow {
  id: string;
  status: 'pending' | 'cancelled';
  createdAt: string;
  cancelledAt: string | null;
  tour: Tour;
}

type Tab = 'upcoming' | 'past' | 'liked';

export function MyTripsClient({
  lang,
  dict,
}: {
  lang: Lang;
  dict: Dictionary;
}) {
  const auth = useAuth();
  const router = useRouter();
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [liked, setLiked] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('upcoming');

  useEffect(() => {
    if (!auth.token) {
      void auth.requestLogin().catch(() => router.push('/'));
      return;
    }
    let cancelled = false;
    Promise.all([userApi.myInterests(), userApi.myLiked()])
      .then(([rows, liked]) => {
        if (cancelled) return;
        setInterests(rows);
        setLiked(liked);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [auth, router]);

  if (!auth.token) {
    return (
      <div className="container-airbnb py-20 text-center text-body-md text-muted">
        Please sign in.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="container-airbnb py-20 text-center text-body-md text-muted">
        Loading…
      </div>
    );
  }

  const now = Date.now();
  const pending = interests.filter((r) => r.status === 'pending');
  const upcoming = pending
    .filter((r) => new Date(r.tour.departureDate).getTime() >= now)
    .map((r) => r.tour);
  const past = pending
    .filter((r) => new Date(r.tour.departureDate).getTime() < now)
    .map((r) => r.tour);
  const archivedFiltered = liked.filter((t) => t.status !== 'archived');

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'past', label: 'Past', count: past.length },
    { id: 'liked', label: 'Liked', count: archivedFiltered.length },
  ];

  const active =
    tab === 'upcoming' ? upcoming : tab === 'past' ? past : archivedFiltered;

  return (
    <div className="container-airbnb py-12">
      <h1 className="text-display-lg text-ink">My trips</h1>

      <div className="mt-6 flex gap-2 border-b border-hairline">
        {tabs.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setTab(b.id)}
            className={
              'px-4 py-3 text-title-sm transition-colors ' +
              (tab === b.id
                ? 'border-b-2 border-ink text-ink'
                : 'text-muted hover:text-ink')
            }
          >
            {b.label} <span className="text-muted-soft">({b.count})</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'past' && past.length > 0 && (
          <Link
            href={`/tours/${past[0].slug}`}
            className="mb-6 block rounded-lg bg-emerald-50 p-5 transition-colors hover:bg-emerald-100"
          >
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-title-sm text-emerald-900">
                  How was your trip?
                </p>
                <p className="mt-0.5 text-body-sm text-emerald-700">
                  Share what you thought of {past[0].title}
                </p>
              </div>
            </div>
          </Link>
        )}
        {active.length === 0 ? (
          <p className="rounded-md border border-dashed border-hairline p-10 text-center text-body-md text-muted">
            Nothing here yet.
          </p>
        ) : (
          <TourGrid tours={active} lang={lang} dict={dict} cols={4} />
        )}
      </div>
    </div>
  );
}
