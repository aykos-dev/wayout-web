import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export function HeroSearch({ dict }: { dict: Dictionary }) {
  return (
    <section className="container-airbnb py-8 sm:py-12">
      <h1 className="text-display-xl text-ink">
        {t(dict, 'tours', 'home.hero')}
      </h1>
      <p className="mt-2 max-w-xl text-body-md text-muted">
        {t(dict, 'tours', 'home.sub')}
      </p>

      <Link
        href="/tours"
        className="mt-6 flex h-16 max-w-3xl items-center justify-between rounded-full border border-hairline bg-white px-6 shadow-airbnb transition-shadow hover:shadow-lg"
      >
        <div className="flex flex-1 items-center gap-6">
          <div>
            <p className="text-caption text-ink">
              {t(dict, 'common', 'nav.tours')}
            </p>
            <p className="text-body-sm text-muted">
              {t(dict, 'common', 'search.placeholder')}
            </p>
          </div>
          <div className="h-8 w-px bg-hairline" />
          <div>
            <p className="text-caption text-ink">
              {t(dict, 'common', 'search.when')}
            </p>
            <p className="text-body-sm text-muted">—</p>
          </div>
          <div className="h-8 w-px bg-hairline" />
          <div>
            <p className="text-caption text-ink">
              {t(dict, 'common', 'search.who')}
            </p>
            <p className="text-body-sm text-muted">—</p>
          </div>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
          <Search className="h-5 w-5" />
        </span>
      </Link>
    </section>
  );
}
