import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/seo';

// Rebuild at most hourly; tours change often enough to warrant it.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tours`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  let tours: MetadataRoute.Sitemap = [];
  let places: MetadataRoute.Sitemap = [];
  try {
    const res = await api.listTours({ limit: 1000, sort: 'created_desc' });
    tours = res.items.map((t) => ({
      url: `${SITE_URL}/tours/${t.slug}`,
      lastModified: new Date(t.updatedAt ?? t.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    /* backend unreachable — ship static routes only */
  }
  try {
    const res = await api.listPlaces({ limit: 1000 });
    places = res.items.map((p) => ({
      url: `${SITE_URL}/destinations/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    /* ignore */
  }

  return [...staticRoutes, ...tours, ...places];
}
