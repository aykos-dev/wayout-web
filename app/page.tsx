import { api } from '@/lib/api';
import { getDict } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { HeroSearch } from '@/components/home/hero-search';
import { CategoryStrip } from '@/components/home/category-strip';
import { FeaturedSection } from '@/components/home/featured-section';
import { ForYouSection } from '@/components/home/for-you-section';
import type { Tour } from '@/lib/types';

async function safeList(params: Parameters<typeof api.listTours>[0]) {
  try {
    return (await api.listTours(params)).items;
  } catch {
    return [] as Tour[];
  }
}

export default async function HomePage() {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  const [dayTrips, weekend, multiDay] = await Promise.all([
    safeList({ durationMax: 1, sort: 'departure_asc', limit: 8 }),
    safeList({ durationMax: 3, sort: 'departure_asc', limit: 8 }),
    safeList({ sort: 'popular', limit: 8 }),
  ]);

  return (
    <>
      <HeroSearch dict={dict} />
      <CategoryStrip dict={dict} />
      <ForYouSection lang={lang} dict={dict} />
      <FeaturedSection
        titleKey="home.dayTrips"
        tours={dayTrips}
        lang={lang}
        dict={dict}
        href="/tours?duration=day"
      />
      <FeaturedSection
        titleKey="home.weekend"
        tours={weekend}
        lang={lang}
        dict={dict}
        href="/tours?duration=weekend"
      />
      <FeaturedSection
        titleKey="home.multiDay"
        tours={multiDay}
        lang={lang}
        dict={dict}
        href="/tours?duration=multi"
      />
    </>
  );
}
