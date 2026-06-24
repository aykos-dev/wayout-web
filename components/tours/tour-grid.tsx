import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { TourCard } from './tour-card';

interface Props {
  tours: Tour[];
  lang: Lang;
  dict: Dictionary;
  cols?: 2 | 3 | 4;
  listContext?: string;
}

const COLS: Record<NonNullable<Props['cols']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function TourGrid({ tours, lang, dict, cols = 4, listContext }: Props) {
  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-10 ${COLS[cols]}`}>
      {tours.map((tour, i) => (
        <TourCard
          key={tour.id}
          tour={tour}
          lang={lang}
          dict={dict}
          priority={i < 4}
          listContext={listContext}
          position={i}
        />
      ))}
    </div>
  );
}
