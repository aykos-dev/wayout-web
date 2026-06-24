import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Footprints, Ruler, Sun, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { PhotoGallery } from '@/components/tours/detail/photo-gallery';
import { DescriptionBlock } from '@/components/tours/detail/description-block';
import { TourTrackMap } from '@/components/tours/detail/tour-track-map';
import { PlaceKeyInfoBar } from '@/components/destinations/place-key-info-bar';
import { UpcomingToursSection } from '@/components/destinations/upcoming-tours-section';
import { PlaceViewTracker } from '@/components/destinations/place-view-tracker';
import { OperatorsRunningHere } from '@/components/destinations/operators-running-here';
import { CategoryChipRow } from '@/components/destinations/category-chip-row';
import { Button } from '@/components/ui/button';
import type { Organization, Place, Tour } from '@/lib/types';
import type { Metadata } from 'next';
import {
  absoluteMedia,
  breadcrumbJsonLd,
  placeJsonLd,
  plainText,
} from '@/lib/seo';

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
    return { title: 'Destination not found' };
  }
  const description =
    plainText(place.whyVisit ?? place.descriptionMd) ||
    `${place.name}${place.region ? `, ${place.region}` : ''} — explore tours on Outway.`;
  const hero = absoluteMedia(place.mediaUrls?.[0]) ?? undefined;
  const ogTitle = place.region ? `${place.name} — ${place.region}` : place.name;
  const path = `/destinations/${place.slug}`;

  return {
    title: place.name,
    description,
    keywords: [
      place.name,
      ...(place.destinationCategories ?? []),
      place.region,
      'Uzbekistan',
      'destination',
    ].filter((v): v is string => !!v),
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title: ogTitle,
      description,
      images: hero ? [hero] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: hero ? [hero] : undefined,
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

  const uniqueOrgIds = Array.from(new Set(tours.map((tour) => tour.orgId)));
  const orgEntries = await Promise.all(
    uniqueOrgIds.map(async (id) => {
      try {
        const org = await api.getOrganization(id);
        return [id, { name: org.name, logoUrl: org.logoUrl }] as const;
      } catch {
        return null;
      }
    }),
  );
  const orgs = new Map<string, Pick<Organization, 'name' | 'logoUrl'>>(
    orgEntries.filter((e): e is NonNullable<typeof e> => !!e),
  );

  const heroImages = place.mediaUrls ?? [];
  const heroImage = heroImages[0];
  const difficultyLabel = place.difficulty
    ? t(dict, 'tours', `difficulty.${place.difficulty}`)
    : '';

  const jsonLd = placeJsonLd(place);
  const breadcrumbs = breadcrumbJsonLd([
    { name: t(dict, 'destinations', 'title'), path: '/destinations' },
    { name: place.name, path: `/destinations/${place.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PlaceViewTracker
        placeId={place.id}
        slug={place.slug}
        category={place.destinationCategories?.[0]}
        difficulty={place.difficulty ?? undefined}
        region={place.region ?? undefined}
      />
      {/* Breadcrumbs */}
      <div className="container-airbnb pt-6 pb-3 text-body-sm text-muted">
        <Link href="/destinations" className="hover:underline">
          {t(dict, 'destinations', 'title')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{place.name}</span>
      </div>

      {/* Immersive hero */}
      {heroImage ? (
        <section className="relative h-[min(72vh,720px)] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
          <div className="container-airbnb relative z-10 flex h-full flex-col justify-end pb-12">
            {place.destinationCategories &&
              place.destinationCategories.length > 0 && (
                <div className="mb-3">
                  <CategoryChipRow categories={place.destinationCategories} />
                </div>
              )}
            <h1 className="text-display-lg max-w-3xl text-white drop-shadow">
              {place.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-body-md text-white/90">
              {place.region && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {place.region}
                </span>
              )}
              {place.difficulty && (
                <span className="inline-flex items-center gap-1.5">
                  <Footprints className="h-4 w-4" />
                  {difficultyLabel}
                </span>
              )}
              {place.lengthKm && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-4 w-4" />
                  {Number(place.lengthKm)} km
                </span>
              )}
              {place.bestSeason && (
                <span className="inline-flex items-center gap-1.5">
                  <Sun className="h-4 w-4" />
                  {place.bestSeason}
                </span>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="container-airbnb pb-6">
          <h1 className="text-display-lg text-ink">{place.name}</h1>
        </div>
      )}

      {/* Why visit pull-quote */}
      {place.whyVisit && (
        <section className="container-airbnb mt-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-caption-sm uppercase tracking-widest text-primary-active">
              {t(dict, 'destinations', 'detail.whyVisit')}
            </p>
            <p className="mt-4 text-display-sm text-ink whitespace-pre-line">
              {place.whyVisit}
            </p>
          </div>
        </section>
      )}

      {/* Key facts strip */}
      <div className="container-airbnb mt-10">
        <PlaceKeyInfoBar place={place} dict={dict} />
      </div>

      {/* Main split: description + operators sidebar */}
      <div className="container-airbnb grid gap-12 py-10 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-8">
          {place.descriptionMd && <DescriptionBlock md={place.descriptionMd} />}
          {tours.length > 0 && (
            <div className="rounded-md border border-hairline bg-surface-soft p-6">
              <p className="text-caption-sm uppercase tracking-widest text-primary-active">
                {t(dict, 'destinations', 'detail.readyToGo')}
              </p>
              <p className="mt-2 text-display-sm text-ink">
                {t(dict, 'destinations', 'detail.findDeparture').replace(
                  '{{n}}',
                  String(tours.length),
                )}
              </p>
              <Button asChild className="mt-4">
                <Link href="#upcoming">
                  {t(dict, 'destinations', 'detail.seeDepartures')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </article>

        <aside>
          <div className="lg:sticky lg:top-[112px] space-y-4">
            <OperatorsRunningHere tours={tours} orgs={orgs} dict={dict} />
          </div>
        </aside>
      </div>

      {/* Hiking track map (if available) */}
      {place.gpxTrackUrl && (
        <section className="container-airbnb mt-2">
          <TourTrackMap
            gpxUrl={place.gpxTrackUrl}
            meetingLat={null}
            meetingLng={null}
            height={480}
            title={t(dict, 'destinations', 'trackTitle')}
          />
        </section>
      )}

      {/* Secondary gallery */}
      {heroImages.length > 1 && (
        <section className="container-airbnb mt-12">
          <h2 className="text-display-sm text-ink mb-4">
            {t(dict, 'destinations', 'detail.bestOf').replace(
              '{{name}}',
              place.name,
            )}
          </h2>
          <PhotoGallery images={heroImages.slice(1)} title={place.name} />
        </section>
      )}

      <div id="upcoming" />
      <UpcomingToursSection
        tours={tours}
        placeName={place.name}
        lang={lang}
        dict={dict}
      />
    </>
  );
}
