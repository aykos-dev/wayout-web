import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { TopPlace } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { DestinationTile } from './destination-tile';

/** Home rail of the 8 top destinations. */
export function TopDestinations({
  places,
  dict,
}: {
  places: TopPlace[];
  dict: Dictionary;
}) {
  if (places.length === 0) return null;
  const countLabel = (n: number) =>
    n > 0 ? t(dict, 'tours', 'home.toursCount').replace('{{n}}', String(n)) : null;

  return (
    <section className="container-airbnb py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-display-md text-ink">
          {t(dict, 'tours', 'home.topDestinations')}
        </h2>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1 text-body-sm text-ink hover:underline"
        >
          {t(dict, 'tours', 'home.seeAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {places.map((p) => (
          <DestinationTile key={p.id} place={p} toursLabel={countLabel(p.tourCount)} />
        ))}
      </div>
    </section>
  );
}
