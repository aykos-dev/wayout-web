import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { TourGrid } from '@/components/tours/tour-grid';

interface Props {
  titleKey: string;
  tours: Tour[];
  lang: Lang;
  dict: Dictionary;
  href?: string;
  listContext?: string;
}

export function FeaturedSection({
  titleKey,
  tours,
  lang,
  dict,
  href,
  listContext = 'home_featured',
}: Props) {
  if (tours.length === 0) return null;
  return (
    <section className="container-airbnb py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-display-md text-ink">
          {t(dict, 'tours', titleKey)}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-body-sm text-ink hover:underline"
          >
            {t(dict, 'tours', 'home.seeAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <TourGrid
        tours={tours.slice(0, 4)}
        lang={lang}
        dict={dict}
        cols={4}
        listContext={listContext}
      />
    </section>
  );
}
