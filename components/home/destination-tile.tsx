import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { TopPlace } from '@/lib/types';
import { absoluteMedia } from '@/lib/seo';

/**
 * Poster-style destination card — image-filled with an overlaid name/region and
 * a tour-count pill. Deliberately distinct from the tour card (no price/date).
 */
export function DestinationTile({
  place,
  toursLabel,
}: {
  place: TopPlace;
  toursLabel: string | null;
}) {
  const img = absoluteMedia(place.mediaUrls?.[0]);
  return (
    <Link
      href={`/destinations/${place.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg"
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={place.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-strong" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {toursLabel && (
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-caption-sm font-semibold text-ink backdrop-blur">
          {toursLabel}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <h3 className="text-title-md leading-tight drop-shadow">{place.name}</h3>
        {place.region && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-body-sm text-white/85">
            <MapPin className="size-3.5" />
            {place.region}
          </p>
        )}
      </div>
    </Link>
  );
}
