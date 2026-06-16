import { notFound } from 'next/navigation';
import { Star, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { PhotoGallery } from '@/components/tours/detail/photo-gallery';
import { KeyInfoBar } from '@/components/tours/detail/key-info-bar';
import { DescriptionBlock } from '@/components/tours/detail/description-block';
import { IncludesList } from '@/components/tours/detail/includes-list';
import { ItineraryTimeline } from '@/components/tours/detail/itinerary-timeline';
import { MeetingMap } from '@/components/tours/detail/meeting-map';
import { GuideCard } from '@/components/tours/detail/guide-card';
import { ReviewsSection } from '@/components/tours/detail/reviews-section';
import { ViewTracker } from '@/components/tours/detail/view-tracker';
import { BookingWidget } from '@/components/tours/detail/booking-widget';
import { MobileCta } from '@/components/tours/detail/mobile-cta';
import { DifficultyScale } from '@/components/tours/difficulty-scale';
import { CategoryBadge } from '@/components/tours/category-badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  params: { slug: string };
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

  // Fetch the operator so the guide card shows a real name + logo, and
  // the existing reviews so the section renders something useful on first paint.
  const org = await api.getOrganization(tour.orgId).catch(() => null);
  const reviews = await api.getTourReviews(tour.id).catch(() => []);

  const meetingLat = tour.meetingPointLat ? Number(tour.meetingPointLat) : null;
  const meetingLng = tour.meetingPointLng ? Number(tour.meetingPointLng) : null;

  return (
    <>
      <div className="container-airbnb pt-6">
        <h1 className="text-display-lg text-ink">{tour.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-muted">
          <span className="inline-flex items-center gap-1 text-ink">
            <Star className="h-4 w-4 fill-ink" /> New
          </span>
          {tour.destination && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {tour.destination}
              </span>
            </>
          )}
          {tour.destinationCategories && tour.destinationCategories.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1.5">
                {tour.destinationCategories.map((c) => (
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
        <PhotoGallery images={tour.mediaUrls ?? []} title={tour.title} />
      </div>

      <div className="container-airbnb mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="space-y-10 pb-32 lg:pb-10">
          <ViewTracker tourId={tour.id} />
          <KeyInfoBar tour={tour} lang={lang} dict={dict} />

          {tour.difficulty && (
            <DifficultyScale
              difficulty={tour.difficulty}
              label={t(dict, 'tours', `difficulty.${tour.difficulty}`)}
              size="md"
            />
          )}

          <DescriptionBlock md={tour.descriptionMd} />

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

          {meetingLat != null && meetingLng != null && (
            <>
              <Separator />
              <MeetingMap
                lat={meetingLat}
                lng={meetingLng}
                description={tour.meetingPointDescription}
                title={t(dict, 'tours', 'detail.meetingPoint')}
              />
            </>
          )}

          <Separator />

          <ReviewsSection
            title={t(dict, 'tours', 'detail.reviews')}
            tourId={tour.id}
            initialReviews={reviews}
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

        <div className="hidden lg:block">
          <BookingWidget tour={tour} lang={lang} dict={dict} />
        </div>
      </div>

      <MobileCta tour={tour} lang={lang} dict={dict} />
    </>
  );
}
