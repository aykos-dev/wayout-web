'use client';

import type { Place } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { cardGridClass } from '@/lib/card-layout';
import { useCardLayout } from '@/lib/use-card-layout';
import { PlaceCard } from './place-card';

interface Props {
  places: Place[];
  lang: Lang;
  dict: Dictionary;
  cols?: 2 | 3 | 4;
  onHoverId?: (id: string | null) => void;
  listContext?: string;
}

export function PlaceGrid({
  places,
  lang,
  dict,
  cols = 2,
  onHoverId,
  listContext,
}: Props) {
  const layout = useCardLayout();
  return (
    <div className={cardGridClass(layout, cols)}>
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
            layout={layout}
            listContext={listContext}
            position={i}
          />
        </div>
      ))}
    </div>
  );
}
