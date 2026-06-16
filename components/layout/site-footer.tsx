import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

const PHONE_NUMBER = '+998946408646';
const PHONE_DISPLAY = '+998 94 640 86 46';

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="container-airbnb py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-title-sm">
              {t(dict, 'common', 'footer.support')}
            </h3>
            <ul className="space-y-2 text-body-sm text-muted">
              <li>
                <a href={`tel:${PHONE_NUMBER}`} className="hover:text-ink">
                  {t(dict, 'common', 'footer.help')} — {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE_NUMBER}`} className="hover:text-ink">
                  {t(dict, 'common', 'footer.contact')} — {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-title-sm">
              {t(dict, 'common', 'footer.legal')}
            </h3>
            <ul className="space-y-2 text-body-sm text-muted">
              <li>
                <Link href="#" className="hover:text-ink">
                  {t(dict, 'common', 'footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-ink">
                  {t(dict, 'common', 'footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-title-sm">Outway</h3>
            <p className="text-body-sm text-muted">
              {t(dict, 'common', 'app.tagline')}
            </p>
          </div>
        </div>
        <p className="mt-10 text-caption-sm text-muted">
          {t(dict, 'common', 'footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
