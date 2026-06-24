import Link from 'next/link';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { TourGrid } from '@/components/tours/tour-grid';
import { Button } from '@/components/ui/button';

interface Props {
  tours: Tour[];
  placeName: string;
  lang: Lang;
  dict: Dictionary;
}

export function UpcomingToursSection({ tours, placeName, lang, dict }: Props) {
  const heading = t(dict, 'destinations', 'upcomingTours').replace(
    '{{name}}',
    placeName,
  );
  const sliced = tours.slice(0, 12);

  return (
    <section className="container-airbnb mt-16 mb-20 border-t border-hairline pt-12">
      <h2 className="text-display-md text-ink">{heading}</h2>
      <p className="mt-1 text-body-md text-muted">
        {sliced.length > 0
          ? `${sliced.length} ${
              sliced.length === 1 ? 'tour' : 'tours'
            } · sorted by nearest departure`
          : ''}
      </p>

      <div className="mt-8">
        {sliced.length > 0 ? (
          <TourGrid
            tours={sliced}
            lang={lang}
            dict={dict}
            cols={4}
            listContext="place_upcoming_tours"
          />
        ) : (
          <div className="rounded-md border border-dashed border-hairline p-10 text-center">
            <p className="text-body-md text-muted">
              {t(dict, 'destinations', 'noUpcomingTours').replace(
                '{{name}}',
                placeName,
              )}
            </p>
            <Button asChild className="mt-5">
              <Link href="/tours">
                {t(dict, 'destinations', 'browseAllTours')}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
