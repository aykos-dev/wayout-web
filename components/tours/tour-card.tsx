import Link from 'next/link';
import { format } from 'date-fns';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { durationDays, durationLabel } from '@/lib/utils';
import { TourCardImage } from './tour-card-image';
import { PriceTag } from './price-tag';
import { DifficultyScale } from './difficulty-scale';
import { Badge } from '@/components/ui/badge';
import { SaveHeartButton } from './save-heart-button';

interface Props {
  tour: Tour;
  lang: Lang;
  dict: Dictionary;
  priority?: boolean;
  variant?: 'grid' | 'list';
}

export function TourCard({ tour, lang, dict, priority, variant = 'grid' }: Props) {
  const days = durationDays(tour.departureDate, tour.returnDate);
  const difficultyLabel = tour.difficulty
    ? t(dict, 'tours', `difficulty.${tour.difficulty}`)
    : '';

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative">
        <TourCardImage
          src={tour.mediaUrls?.[0] ?? null}
          alt={tour.title}
          aspect={variant === 'list' ? 'video' : 'portrait'}
          priority={priority}
        />
        {tour.seatsAvailable === 0 && (
          <Badge
            variant="primary"
            className="absolute left-3 top-3"
          >
            {t(dict, 'tours', 'card.soldOut')}
          </Badge>
        )}
        {tour.seatsAvailable > 0 && tour.seatsAvailable <= 5 && (
          <Badge
            variant="floating"
            className="absolute left-3 top-3"
          >
            {t(dict, 'tours', 'card.seats').replace(
              '{{n}}',
              String(tour.seatsAvailable),
            )}
          </Badge>
        )}
        <SaveHeartButton tourId={tour.id} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-title-md text-ink line-clamp-1">{tour.title}</h3>
          {tour.destination && (
            <span className="text-body-sm text-muted line-clamp-1">
              {tour.destination}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-body-sm text-muted">
          <span>{durationLabel(days, lang)}</span>
          <span>·</span>
          <span>{format(new Date(tour.departureDate), 'MMM d')}</span>
          {tour.lengthKm && (
            <>
              <span>·</span>
              <span>{Number(tour.lengthKm)} km</span>
            </>
          )}
        </div>
        {tour.difficulty && (
          <DifficultyScale
            difficulty={tour.difficulty}
            label={difficultyLabel}
            size="sm"
          />
        )}
        <div className="mt-1">
          <PriceTag
            amount={tour.finalPriceAmount}
            currency={tour.priceCurrency}
            perPerson={t(dict, 'tours', 'card.perPerson')}
            fromLabel={t(dict, 'tours', 'card.from')}
            lang={lang}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}
