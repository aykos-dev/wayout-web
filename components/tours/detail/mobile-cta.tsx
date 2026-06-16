'use client';

import { PriceTag } from '../price-tag';
import { BookingFlow } from './booking-flow';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export function MobileCta({
  tour,
  lang,
  dict,
}: {
  tour: Tour;
  lang: Lang;
  dict: Dictionary;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <PriceTag
          amount={tour.finalPriceAmount}
          currency={tour.priceCurrency}
          perPerson={t(dict, 'tours', 'card.perPerson')}
          lang={lang}
          size="sm"
        />
        <BookingFlow tour={tour} lang={lang} dict={dict} />
      </div>
    </div>
  );
}
