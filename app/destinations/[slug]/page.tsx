import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Footprints, Ruler } from 'lucide-react';
import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { PhotoGallery } from '@/components/tours/detail/photo-gallery';
import { DescriptionBlock } from '@/components/tours/detail/description-block';
import { IncludesList } from '@/components/tours/detail/includes-list';
import { TourTrackMap } from '@/components/tours/detail/tour-track-map';
import { PlaceKeyInfoBar } from '@/components/destinations/place-key-info-bar';
import { PlaceItineraryTimeline } from '@/components/destinations/place-itinerary-timeline';
import { MeetingPointCard } from '@/components/destinations/meeting-point-card';
import { UpcomingToursSection } from '@/components/destinations/upcoming-tours-section';
import { CategoryChipRow } from '@/components/destinations/category-chip-row';
import type { Place, Tour } from '@/lib/types';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

async function loadPlace(slug: string): Promise<Place | null> {
  try {
    return await api.getPlaceBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await loadPlace(params.slug);
  if (!place) {
    return { title: 'Destination not found · Outway' };
  }
  const cleanDesc = (place.descriptionMd ?? '')
    .replace(/[#>*_`~\-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const hero = place.mediaUrls?.[0];
  return {
    title: `${place.name} — Destinations · Outway`,
    description: cleanDesc || `${place.name} on Outway.`,
    alternates: { canonical: `/destinations/${place.slug}` },
    openGraph: {
      title: `${place.name} — Destinations · Outway`,
      description: cleanDesc || undefined,
      images: hero ? [hero] : ['/app-icon.png'],
    },
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  const place = await loadPlace(params.slug);
  if (!place) notFound();

  let tours: Tour[] = [];
  try {
    tours = await api.upcomingToursForPlace(place.id, 12);
  } catch {
    tours = [];
  }

  const meetingLat = place.meetingPointLat ? Number(place.meetingPointLat) : null;
  const meetingLng = place.meetingPointLng ? Number(place.meetingPointLng) : null;
  const hasGallery = (place.mediaUrls?.length ?? 0) > 0;
  const hasIncludes = (place.includes?.length ?? 0) > 0;
  const hasExcludes = (place.excludes?.length ?? 0) > 0;
  const difficultyLabel = place.difficulty
    ? t(dict, 'tours', `difficulty.${place.difficulty}`)
    : '';

  return (
    <>
      {/* Breadcrumbs */}
      <div className="container-airbnb pt-6 pb-2 text-body-sm text-muted">
        <Link href="/destinations" className="hover:underline">
          {t(dict, 'destinations', 'title')}
        </Link>
        {place.region && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/destinations?region=${encodeURIComponent(place.region)}`}
              className="hover:underline"
            >
              {place.region}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{place.name}</span>
      </div>

      {/* Title block */}
      <div className="container-airbnb pb-4">
        <h1
          className="text-display-lg text-ink line-clamp-2"
          title={place.name}
        >
          {place.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-muted">
          {place.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {place.region}
            </span>
          )}
          {place.difficulty && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Footprints className="h-4 w-4" />
                {difficultyLabel}
              </span>
            </>
          )}
          {place.lengthKm && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {Number(place.lengthKm)} km
              </span>
            </>
          )}
          {place.destinationCategories &&
            place.destinationCategories.length > 0 && (
              <>
                <span>·</span>
                <CategoryChipRow categories={place.destinationCategories} />
              </>
            )}
        </div>
      </div>

      {hasGallery && (
        <div className="mt-2">
          <PhotoGallery images={place.mediaUrls ?? []} title={place.name} />
        </div>
      )}

      <div className="container-airbnb mt-8">
        <PlaceKeyInfoBar place={place} dict={dict} />
      </div>

      <div className="container-airbnb grid gap-12 py-8 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-10">
          {place.descriptionMd && <DescriptionBlock md={place.descriptionMd} />}

          <PlaceItineraryTimeline
            items={place.itinerary}
            title={t(dict, 'tours', 'detail.itinerary')}
          />

          {(hasIncludes || hasExcludes) && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {hasIncludes && (
                <IncludesList
                  variant="included"
                  title={t(dict, 'tours', 'detail.included')}
                  items={place.includes ?? []}
                />
              )}
              {hasExcludes && (
                <IncludesList
                  variant="excluded"
                  title={t(dict, 'tours', 'detail.excluded')}
                  items={place.excludes ?? []}
                />
              )}
            </div>
          )}
        </article>

        <aside>
          <div className="lg:sticky lg:top-[112px]">
            <MeetingPointCard
              description={place.meetingPointDescription}
              lat={meetingLat}
              lng={meetingLng}
              title={t(dict, 'tours', 'detail.meetingPoint')}
            />
          </div>
        </aside>
      </div>

      {place.gpxTrackUrl && (
        <section className="container-airbnb mt-10">
          <TourTrackMap
            gpxUrl={place.gpxTrackUrl}
            meetingLat={meetingLat}
            meetingLng={meetingLng}
            height={480}
            title={t(dict, 'destinations', 'trackTitle')}
          />
        </section>
      )}

      <UpcomingToursSection
        tours={tours}
        placeName={place.name}
        lang={lang}
        dict={dict}
      />
    </>
  );
}
