import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Star, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { breadcrumbJsonLd, plainText, tourJsonLd } from '@/lib/seo';
import { PhotoGallery } from '@/components/tours/detail/photo-gallery';
import { KeyInfoBar } from '@/components/tours/detail/key-info-bar';
import { DescriptionBlock } from '@/components/tours/detail/description-block';
import { IncludesList } from '@/components/tours/detail/includes-list';
import { ItineraryTimeline } from '@/components/tours/detail/itinerary-timeline';
import { TourTrackMap } from '@/components/tours/detail/tour-track-map';
import { GuideCard } from '@/components/tours/detail/guide-card';
import { ViewTracker } from '@/components/tours/detail/view-tracker';
import { ReviewsSection } from '@/components/tours/detail/reviews-section';
import { DateSelector } from '@/components/tours/detail/date-selector';
import { DifficultyScale } from '@/components/tours/difficulty-scale';
import { CategoryBadge } from '@/components/tours/category-badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let tour;
  try {
    tour = await api.getTourBySlug(params.slug);
  } catch {
    return { title: 'Tour not found' };
  }
  const place = tour.place;
  const title = tour.title ?? place?.name ?? 'Tour';
  const region = place?.region;
  const description =
    plainText(tour.descriptionMd ?? place?.whyVisit ?? place?.descriptionMd) ||
    `${title}${region ? ` — ${region}` : ''}. Book this nature tour on Outway.`;
  const path = `/tours/${tour.slug}`;
  const ogTitle = region ? `${title} — ${region}` : title;

  return {
    title,
    description,
    keywords: [
      ...(place?.destinationCategories ?? []),
      region,
      'Uzbekistan',
      'tour',
      'hiking',
    ].filter((v): v is string => !!v),
    alternates: { canonical: path },
    // OG/Twitter images come from the colocated opengraph-image.tsx route.
    openGraph: {
      type: 'article',
      url: path,
      title: ogTitle,
      description,
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description },
  };
}

export default async function TourDetailPage({ params }: Props) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  let tour;
  try {
    tour = await api.getTourBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!tour) notFound();
  const place = tour.place;

  const org = await api.getOrganization(tour.orgId).catch(() => null);
  const reviews = await api.getTourReviews(tour.id).catch(() => []);

  const meetingLat = tour.meetingPointLat ? Number(tour.meetingPointLat) : null;
  const meetingLng = tour.meetingPointLng ? Number(tour.meetingPointLng) : null;

  const title = tour.title ?? place?.name ?? 'Tour';
  const description = tour.descriptionMd ?? place?.descriptionMd ?? null;

  const jsonLd = tourJsonLd({ tour, place, org, reviews });
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Tours', path: '/tours' },
    { name: title, path: `/tours/${tour.slug}` },
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
      <div className="container-airbnb pt-6">
        <h1 className="text-display-lg text-ink">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-muted">
          <span className="inline-flex items-center gap-1 text-ink">
            <Star className="h-4 w-4 fill-ink" /> New
          </span>
          {place?.region && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {place.region}
              </span>
            </>
          )}
          {place?.destinationCategories &&
            place.destinationCategories.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1.5">
                  {place.destinationCategories.map((c) => (
                    <CategoryBadge
                      key={c}
                      category={c}
                      label={t(dict, 'tours', `categories.${c}`)}
                    />
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      <div className="mt-6">
        <PhotoGallery
          images={place?.mediaUrls ?? []}
          title={title}
          tourId={tour.id}
        />
      </div>

      <div className="container-airbnb mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="space-y-10 pb-32 lg:pb-10">
          <ViewTracker
            tourId={tour.id}
            slug={tour.slug}
            orgId={tour.orgId}
            category={place?.destinationCategories?.[0]}
            difficulty={place?.difficulty ?? undefined}
            price={
              typeof tour.finalPriceAmount === 'number'
                ? tour.finalPriceAmount
                : Number(tour.finalPriceAmount) || undefined
            }
            currency={tour.priceCurrency ?? undefined}
          />
          <KeyInfoBar tour={tour} lang={lang} dict={dict} />

          {place?.difficulty && (
            <DifficultyScale
              difficulty={place.difficulty}
              label={t(dict, 'tours', `difficulty.${place.difficulty}`)}
              size="md"
            />
          )}

          <DescriptionBlock md={description} />

          <Separator />

          <div className="grid gap-10 sm:grid-cols-2">
            <IncludesList
              variant="included"
              title={t(dict, 'tours', 'detail.included')}
              items={tour.includes ?? []}
            />
            <IncludesList
              variant="excluded"
              title={t(dict, 'tours', 'detail.excluded')}
              items={tour.excludes ?? []}
            />
          </div>

          <Separator />

          <ItineraryTimeline
            tour={tour}
            title={t(dict, 'tours', 'detail.itinerary')}
          />

          {(meetingLat != null || place?.gpxTrackUrl) && (
            <>
              <Separator />
              <TourTrackMap
                gpxUrl={place?.gpxTrackUrl ?? null}
                meetingLat={meetingLat}
                meetingLng={meetingLng}
                description={tour.meetingPointDescription ?? null}
                title={t(dict, 'tours', 'detail.meetingPoint')}
              />
            </>
          )}

          <Separator />

          <ReviewsSection
            tourId={tour.id}
            initialReviews={reviews}
            title={t(dict, 'tours', 'detail.reviews')}
          />

          <Separator />

          <GuideCard
            orgId={tour.orgId}
            orgName={org?.name ?? 'Operator'}
            orgLogo={org?.logoUrl ?? null}
            contactInfo={tour.contactInfo ?? org?.contactPhone ?? null}
            title={t(dict, 'tours', 'detail.guide')}
          />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-lg border border-hairline p-5">
            <div>
              <p className="text-title-md text-ink">
                {tour.finalPriceAmount}{' '}
                <span className="text-body-sm text-muted">
                  {tour.priceCurrency}
                </span>
              </p>
              <p className="text-body-sm text-muted">per person</p>
            </div>
            <div className="text-body-sm text-muted">
              {tour.seatsAvailable}/{tour.seatsTotal} seats left
            </div>
            {tour.seatsAvailable > 0 ? (
              <DateSelector
                tourId={tour.id}
                dates={tour.dates ?? []}
                fallbackDeparture={tour.departureDate}
                fallbackReturn={tour.returnDate}
                dict={dict}
              />
            ) : (
              <p className="rounded-md bg-ink/5 px-3 py-2 text-center text-sm text-muted">
                Sold out
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
