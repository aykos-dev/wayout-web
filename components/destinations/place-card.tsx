'use client';

import Link from 'next/link';
import { MapPin, Ruler, Footprints } from 'lucide-react';
import type { Place } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { TourCardImage } from '@/components/tours/tour-card-image';
import { DifficultyScale } from '@/components/tours/difficulty-scale';
import { CategoryChipRow } from './category-chip-row';
import { track } from '@/lib/analytics';

interface Props {
  place: Place;
  lang: Lang;
  dict: Dictionary;
  priority?: boolean;
  listContext?: string;
  position?: number;
}

export function PlaceCard({
  place,
  lang,
  dict,
  priority,
  listContext = 'destinations_list',
  position,
}: Props) {
  const difficultyLabel = place.difficulty
    ? t(dict, 'tours', `difficulty.${place.difficulty}`)
    : '';

  return (
    <Link
      href={`/destinations/${place.slug}`}
      onClick={() =>
        track('select_content', {
          content_type: 'place',
          item_id: place.id,
          slug: place.slug,
          list_context: listContext,
          position,
        })
      }
      className="group flex flex-col gap-3"
      title={place.name}
    >
      <div className="relative">
        <TourCardImage
          src={place.mediaUrls?.[0] ?? null}
          alt={place.name}
          aspect="portrait"
          priority={priority}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-title-md text-ink line-clamp-1">{place.name}</h3>
          {place.region && (
            <span className="text-body-sm text-muted line-clamp-1">
              {place.region}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
          {place.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {place.region}
            </span>
          )}
          {place.lengthKm && (
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
        {place.difficulty && (
          <DifficultyScale
            difficulty={place.difficulty}
            label={difficultyLabel}
            size="sm"
          />
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
