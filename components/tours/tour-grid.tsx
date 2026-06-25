'use client';

import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { cardGridClass } from '@/lib/card-layout';
import { useCardLayout } from '@/lib/use-card-layout';
import { TourCard } from './tour-card';

interface Props {
  tours: Tour[];
  lang: Lang;
  dict: Dictionary;
  cols?: 2 | 3 | 4;
  listContext?: string;
}

export function TourGrid({ tours, lang, dict, cols = 4, listContext }: Props) {
  const layout = useCardLayout();
  return (
    <div className={cardGridClass(layout, cols)}>
      {tours.map((tour, i) => (
        <TourCard
          key={tour.id}
          tour={tour}
          lang={lang}
          dict={dict}
          priority={i < 4}
          layout={layout}
          listContext={listContext}
          position={i}
        />
      ))}
    </div>
  );
}
