'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePreferences } from '@/lib/preferences';
import { TourGrid } from '@/components/tours/tour-grid';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

interface Props {
  lang: Lang;
  dict: Dictionary;
}

export function ForYouSection({ lang, dict }: Props) {
  const { token } = useAuth();
  const { categories, hydrated, hydrate } = usePreferences();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token || !hydrated) return;

    const qs = new URLSearchParams({ limit: '12' });
    if (categories.length > 0) {
      qs.set('categories', categories.join(','));
    }

    fetch(`${BASE}/tours/for-you?${qs.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
      .then((res) => (res.ok ? (res.json() as Promise<Tour[]>) : []))
      .catch(() => [] as Tour[])
      .then((data) => setTours(data))
      .finally(() => setLoading(false));
  }, [token, hydrated, categories]);

  if (!token) return null;
  if (loading) return null;
  if (tours.length === 0) return null;

  const title = categories.length > 0 ? 'For You' : 'Popular';

  return (
    <section className="container-airbnb py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-display-md text-ink">{title}</h2>
      </div>
      <TourGrid
        tours={tours.slice(0, 12)}
        lang={lang}
        dict={dict}
        cols={4}
        listContext="home_for_you"
      />
    </section>
  );
}
