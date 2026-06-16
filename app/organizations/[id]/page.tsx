import { notFound } from 'next/navigation';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { getDict, t } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { TourGrid } from '@/components/tours/tour-grid';

interface Props {
  params: { id: string };
}

export default async function OrganizationPage({ params }: Props) {
  const lang = getLangFromCookies();
  const dict = getDict(lang);

  let org;
  try {
    org = await api.getOrganization(params.id);
  } catch {
    notFound();
  }
  if (!org) notFound();

  return (
    <>
      <header className="border-b border-hairline-soft bg-white">
        <div className="container-airbnb flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-surface-strong">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logoUrl}
                alt={org.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-display-md text-muted">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="inline-flex items-center gap-1 text-body-sm text-muted">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verified operator
            </p>
            <h1 className="mt-1 text-display-lg text-ink">{org.name}</h1>
            {org.description && (
              <p className="mt-2 max-w-2xl text-body-md text-body">
                {org.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-body-sm text-muted">
              {org.contactPhone && (
                <a
                  href={`tel:${org.contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  <Phone className="h-4 w-4" />
                  {org.contactPhone}
                </a>
              )}
              {org.contactEmail && (
                <a
                  href={`mailto:${org.contactEmail}`}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  <Mail className="h-4 w-4" />
                  {org.contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="container-airbnb py-12">
        <h2 className="mb-6 text-display-md text-ink">
          {t(dict, 'tours', 'list.title')} ({org.tours.length})
        </h2>
        {org.tours.length === 0 ? (
          <p className="rounded-md border border-dashed border-hairline p-10 text-center text-body-md text-muted">
            No published tours yet.
          </p>
        ) : (
          <TourGrid tours={org.tours} lang={lang} dict={dict} cols={4} />
        )}
      </section>
    </>
  );
}
