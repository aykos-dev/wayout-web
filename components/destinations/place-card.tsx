'use client';

import Link from 'next/link';
import { MapPin, Ruler, Footprints } from 'lucide-react';
import type { Place } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { CARD_LAYOUT, type CardLayout } from '@/lib/card-layout';
import { TourCardImage } from '@/components/tours/tour-card-image';
import { DifficultyScale } from '@/components/tours/difficulty-scale';
import { CategoryChipRow } from './category-chip-row';
import { track } from '@/lib/analytics';

interface Props {
  place: Place;
  lang: Lang;
  dict: Dictionary;
  priority?: boolean;
  layout?: CardLayout;
  listContext?: string;
  position?: number;
}

const IMAGE_ASPECT = {
  grid: 'landscape',
  single: 'video',
  rows: 'square',
} as const;

const IMAGE_SIZES = {
  grid: '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw',
  single: '(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw',
  rows: '(max-width: 640px) 40vw, (max-width: 1280px) 33vw, 25vw',
} as const;

export function PlaceCard({
  place,
  lang,
  dict,
  priority,
  layout = CARD_LAYOUT,
  listContext = 'destinations_list',
  position,
}: Props) {
  const difficultyLabel = place.difficulty
    ? t(dict, 'tours', `difficulty.${place.difficulty}`)
    : '';
  const isRows = layout === 'rows';
  const isCompact = layout === 'grid';

  const onClick = () =>
    track('select_content', {
      content_type: 'place',
      item_id: place.id,
      slug: place.slug,
      list_context: listContext,
      position,
    });

  const image = (
    <TourCardImage
      src={place.mediaUrls?.[0] ?? null}
      alt={place.name}
      aspect={IMAGE_ASPECT[layout]}
      sizes={IMAGE_SIZES[layout]}
      priority={priority}
    />
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-body-sm text-muted">
      {place.region && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {place.region}
        </span>
      )}
      {place.lengthKm && !isCompact && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            {Number(place.lengthKm)} km
          </span>
        </>
      )}
      {place.difficulty && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Footprints className="h-3.5 w-3.5" />
            {difficultyLabel || place.difficulty}
          </span>
        </>
      )}
    </div>
  );

  if (isRows) {
    return (
      <Link
        href={`/destinations/${place.slug}`}
        onClick={onClick}
        className="group flex gap-3"
        title={place.name}
      >
        <div className="w-2/5 shrink-0 sm:w-32">{image}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
          <h3 className="text-title-sm text-ink line-clamp-2">{place.name}</h3>
          {meta}
          {place.destinationCategories && place.destinationCategories.length > 0 && (
            <div className="mt-auto pt-1">
              <CategoryChipRow categories={place.destinationCategories} max={3} />
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/destinations/${place.slug}`}
      onClick={onClick}
      className="group flex flex-col gap-2.5"
      title={place.name}
    >
      {image}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`${isCompact ? 'text-title-sm' : 'text-title-md'} text-ink line-clamp-1`}>
            {place.name}
          </h3>
          {place.region && !isCompact && (
            <span className="text-body-sm text-muted line-clamp-1">{place.region}</span>
          )}
        </div>
        {meta}
        {place.difficulty && !isCompact && (
          <DifficultyScale difficulty={place.difficulty} label={difficultyLabel} size="sm" />
        )}
        {place.destinationCategories && place.destinationCategories.length > 0 && (
          <div className="mt-1">
            <CategoryChipRow categories={place.destinationCategories} max={3} />
          </div>
        )}
      </div>
    </Link>
  );
}
