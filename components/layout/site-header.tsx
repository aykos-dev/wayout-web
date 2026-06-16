import Image from 'next/image';
import Link from 'next/link';
import { LangSwitcher } from './lang-switcher';
import { UserMenu } from './user-menu';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
  dict: Dictionary;
}

export function SiteHeader({ lang, dict }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="container-airbnb flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 overflow-hidden rounded-[32%] shadow-airbnb">
            <Image
              src="/app-icon.png"
              alt="Outway"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="flex flex-col">
            <span className="text-[18px] font-black tracking-normal text-ink">
              Outway
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-active">
              Nature routes
            </span>
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          <Link
            href="/tours"
            className="text-title-md text-ink hover:text-primary"
          >
            {t(dict, 'common', 'nav.tours')}
          </Link>
          <Link
            href="/tours?sort=popular"
            className="text-title-md text-muted hover:text-ink"
          >
            {t(dict, 'common', 'nav.destinations')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher current={lang} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
