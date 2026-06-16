'use client';

import { format } from 'date-fns';
import { Calendar, Users } from 'lucide-react';
import { PriceTag } from '../price-tag';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { BookingFlow } from './booking-flow';

interface Props {
  tour: Tour;
  lang: Lang;
  dict: Dictionary;
  sticky?: boolean;
}

export function BookingWidget({ tour, lang, dict, sticky = true }: Props) {
  const soldOut = tour.seatsAvailable === 0;
  return (
    <aside
      className={
        'rounded-md border border-hairline bg-white p-6 shadow-airbnb ' +
        (sticky ? 'lg:sticky lg:top-28' : '')
      }
    >
      <PriceTag
        amount={tour.finalPriceAmount}
        currency={tour.priceCurrency}
        perPerson={t(dict, 'tours', 'card.perPerson')}
        fromLabel={t(dict, 'tours', 'detail.from')}
        lang={lang}
        size="lg"
      />

      <div className="mt-6 rounded-sm border border-hairline">
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <Calendar className="h-4 w-4 text-muted" />
          <div className="flex-1">
            <p className="text-caption-sm text-muted">
              {t(dict, 'tours', 'detail.duration')}
            </p>
            {tour.dates && tour.dates.length > 1 ? (
              <div className="space-y-1">
                {tour.dates.map((d, i) => (
                  <p key={i} className="text-body-sm text-ink">
                    {format(new Date(d.departureDate), 'PP')} →{' '}
                    {format(new Date(d.returnDate), 'PP')}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-ink">
                {format(new Date(tour.departureDate), 'PP')} →{' '}
                {format(new Date(tour.returnDate), 'PP')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Users className="h-4 w-4 text-muted" />
          <div className="flex-1">
            <p className="text-caption-sm text-muted">
              {t(dict, 'tours', 'detail.groupSize')}
            </p>
            <p className="text-body-sm text-ink">
              {soldOut
                ? t(dict, 'tours', 'card.soldOut')
                : t(dict, 'tours', 'card.seats').replace(
                    '{{n}}',
                    String(tour.seatsAvailable),
                  )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BookingFlow
          tour={tour}
          lang={lang}
          dict={dict}
          buttonClassName="w-full"
        />
      </div>

      {tour.sourceMsgUrl && (
        <a
          href={tour.sourceMsgUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-center text-body-sm text-muted hover:text-ink"
        >
          {t(dict, 'tours', 'detail.viewOriginal')}
        </a>
      )}
    </aside>
  );
}
