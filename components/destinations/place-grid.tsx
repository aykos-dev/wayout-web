'use client';

import type { Place } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { PlaceCard } from './place-card';

interface Props {
  places: Place[];
  lang: Lang;
  dict: Dictionary;
  cols?: 2 | 3 | 4;
  onHoverId?: (id: string | null) => void;
  listContext?: string;
}

const COLS: Record<NonNullable<Props['cols']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function PlaceGrid({
  places,
  lang,
  dict,
  cols = 2,
  onHoverId,
  listContext,
}: Props) {
  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-10 ${COLS[cols]}`}>
      {places.map((place, i) => (
        <div
          key={place.id}
          onMouseEnter={onHoverId ? () => onHoverId(place.id) : undefined}
          onMouseLeave={onHoverId ? () => onHoverId(null) : undefined}
        >
          <PlaceCard
            place={place}
            lang={lang}
            dict={dict}
            priority={i < 4}
            listContext={listContext}
            position={i}
          />
        </div>
      ))}
    </div>
  );
}
