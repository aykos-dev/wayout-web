'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { durationDays, durationLabel } from '@/lib/utils';
import { CARD_LAYOUT, type CardLayout } from '@/lib/card-layout';
import { TourCardImage } from './tour-card-image';
import { PriceTag } from './price-tag';
import { DifficultyScale } from './difficulty-scale';
import { Badge } from '@/components/ui/badge';
import { SaveHeartButton } from './save-heart-button';
import { track } from '@/lib/analytics';

interface Props {
  tour: Tour;
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

export function TourCard({
  tour,
  lang,
  dict,
  priority,
  layout = CARD_LAYOUT,
  listContext,
  position,
}: Props) {
  const days = durationDays(tour.departureDate, tour.returnDate);
  const place = tour.place;
  const title = tour.title ?? place?.name ?? 'Tour';
  const difficultyLabel = place?.difficulty
    ? t(dict, 'tours', `difficulty.${place.difficulty}`)
    : '';
  const isRows = layout === 'rows';
  const isCompact = layout === 'grid';

  const onClick = () =>
    track('select_content', {
      content_type: 'tour',
      item_id: tour.id,
      slug: tour.slug,
      list_context: listContext,
      position,
    });

  const image = (
    <div className="relative">
      <TourCardImage
        src={place?.mediaUrls?.[0] ?? null}
        alt={title}
        aspect={IMAGE_ASPECT[layout]}
        sizes={IMAGE_SIZES[layout]}
        priority={priority}
      />
      {tour.seatsAvailable === 0 && (
        <Badge variant="primary" className="absolute left-2 top-2">
          {t(dict, 'tours', 'card.soldOut')}
        </Badge>
      )}
      {tour.seatsAvailable > 0 && tour.seatsAvailable <= 5 && (
        <Badge variant="floating" className="absolute left-2 top-2">
          {t(dict, 'tours', 'card.seats').replace('{{n}}', String(tour.seatsAvailable))}
        </Badge>
      )}
      <SaveHeartButton tourId={tour.id} className="absolute right-2 top-2" />
    </div>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-body-sm text-muted">
      <span>{durationLabel(days, lang)}</span>
      <span>·</span>
      <span>{format(new Date(tour.departureDate), 'MMM d')}</span>
      {tour.dates && tour.dates.length > 1 && (
        <span className="text-primary-active">
          {t(dict, 'tours', 'card.moreDates').replace('{{n}}', String(tour.dates.length - 1))}
        </span>
      )}
      {place?.lengthKm && !isCompact && (
        <>
          <span>·</span>
          <span>{Number(place.lengthKm)} km</span>
        </>
      )}
    </div>
  );

  const price = (
    <PriceTag
      amount={tour.finalPriceAmount}
      currency={tour.priceCurrency}
      perPerson={t(dict, 'tours', 'card.perPerson')}
      fromLabel={t(dict, 'tours', 'card.from')}
      lang={lang}
      size="sm"
    />
  );

  if (isRows) {
    return (
      <Link
        href={`/tours/${tour.slug}`}
        onClick={onClick}
        className="group flex gap-3"
      >
        <div className="w-2/5 shrink-0 sm:w-32">{image}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
          <h3 className="text-title-sm text-ink line-clamp-2">{title}</h3>
          {place?.region && (
            <span className="text-body-sm text-muted line-clamp-1">{place.region}</span>
          )}
          {meta}
          <div className="mt-auto pt-1">{price}</div>
        </div>
      </Link>
    );
  }

  // Vertical: `grid` (compact 4:3) and `single` (16:9).
  return (
    <Link href={`/tours/${tour.slug}`} onClick={onClick} className="group flex flex-col gap-2.5">
      {image}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`${isCompact ? 'text-title-sm' : 'text-title-md'} text-ink line-clamp-1`}>
            {title}
          </h3>
          {place?.region && !isCompact && (
            <span className="text-body-sm text-muted line-clamp-1">{place.region}</span>
          )}
        </div>
        {meta}
        {place?.difficulty && !isCompact && (
          <DifficultyScale difficulty={place.difficulty} label={difficultyLabel} size="sm" />
        )}
        <div className="mt-1">{price}</div>
      </div>
    </Link>
  );
}
