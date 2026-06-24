import type { Organization, Place, Review, Tour } from './types';

export const SITE_NAME = 'Outway';

/** Canonical public origin, e.g. https://outway.uz (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://outway.uz'
).replace(/\/$/, '');

/** Backend origin (strips the `/v1` API suffix) — used to absolutize uploads. */
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1'
).replace(/\/v1\/?$/, '');

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Turns a possibly-relative media URL into an absolute one (for OG/JSON-LD). */
export function absoluteMedia(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Collapses markdown to a clean, length-capped plain-text snippet. */
export function plainText(md?: string | null, max = 160): string {
  if (!md) return '';
  const text = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → label
    .replace(/[#>*_`~]+/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function avgRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return (
    Math.round(
      (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
    ) / 10
  );
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** schema.org/Product for a tour — richest rich-result coverage (price + stars). */
export function tourJsonLd(args: {
  tour: Tour;
  place?: Place;
  org?: Organization | null;
  reviews: Review[];
}) {
  const { tour, place, org, reviews } = args;
  const name = tour.title ?? place?.name ?? 'Tour';
  const images = (place?.mediaUrls ?? [])
    .map((u) => absoluteMedia(u))
    .filter((u): u is string => !!u);
  const url = absoluteUrl(`/tours/${tour.slug}`);
  const rating = avgRating(reviews);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description:
      plainText(tour.descriptionMd ?? place?.descriptionMd, 300) || name,
    image: images.length > 0 ? images : undefined,
    category: place?.destinationCategories?.[0],
    brand: org?.name
      ? { '@type': 'Organization', name: org.name }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: Number(tour.finalPriceAmount),
      priceCurrency: tour.priceCurrency,
      availability:
        tour.seatsAvailable > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      url,
      ...(tour.publishedAt ? { validFrom: tour.publishedAt } : {}),
    },
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: reviews.length,
          },
          review: reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
            },
            author: { '@type': 'Person', name: r.author?.name ?? 'Guest' },
            ...(r.body ? { reviewBody: r.body } : {}),
            datePublished: r.createdAt,
          })),
        }
      : {}),
  };
}

/** schema.org/TouristDestination for a place page. */
export function placeJsonLd(place: Place) {
  const images = (place.mediaUrls ?? [])
    .map((u) => absoluteMedia(u))
    .filter((u): u is string => !!u);
  const lat = place.latitude ? Number(place.latitude) : null;
  const lng = place.longitude ? Number(place.longitude) : null;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: place.name,
    description:
      plainText(place.whyVisit ?? place.descriptionMd, 300) || place.name,
    image: images.length > 0 ? images : undefined,
    url: absoluteUrl(`/destinations/${place.slug}`),
    ...(place.region ? { addressRegion: place.region } : {}),
    ...(lat != null && lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } }
      : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tours?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/app-icon.png'),
    description: 'Curated nature routes and tours across Uzbekistan.',
  };
}
