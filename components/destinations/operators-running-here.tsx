import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface OperatorSummary {
  orgId: string;
  name: string;
  logoUrl: string | null;
  tourCount: number;
  nextSlug: string;
}

interface Props {
  tours: Tour[];
  orgs: Map<string, { name: string; logoUrl: string | null }>;
  dict: Dictionary;
}

export function OperatorsRunningHere({ tours, orgs, dict }: Props) {
  const seen = new Map<string, OperatorSummary>();
  for (const tour of tours) {
    const meta = orgs.get(tour.orgId);
    if (!meta) continue;
    const existing = seen.get(tour.orgId);
    if (existing) {
      existing.tourCount += 1;
      continue;
    }
    seen.set(tour.orgId, {
      orgId: tour.orgId,
      name: meta.name,
      logoUrl: meta.logoUrl,
      tourCount: 1,
      nextSlug: tour.slug,
    });
  }
  const operators = Array.from(seen.values());
  if (operators.length === 0) return null;

  return (
    <section className="rounded-md border border-hairline bg-white p-6">
      <h3 className="text-title-md text-ink">
        {t(dict, 'destinations', 'detail.operators')}
      </h3>
      <p className="mt-1 text-body-sm text-muted">
        {t(dict, 'destinations', 'detail.operatorsHint')}
      </p>
      <ul className="mt-4 space-y-3">
        {operators.map((op) => (
          <li key={op.orgId}>
            <Link
              href={`/organizations/${encodeURIComponent(op.orgId)}`}
              className="flex items-center gap-3 rounded-md p-2 -mx-2 hover:bg-surface-soft"
            >
              <span className="inline-flex h-10 w-10 overflow-hidden rounded-full border border-hairline bg-surface-soft">
                {op.logoUrl ? (
                  <Image
                    src={op.logoUrl}
                    alt={op.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-title-sm text-ink line-clamp-1">{op.name}</p>
                <p className="text-caption-sm text-muted">
                  {op.tourCount === 1
                    ? t(dict, 'destinations', 'detail.oneTour')
                    : t(dict, 'destinations', 'detail.someTours').replace(
                        '{{n}}',
                        String(op.tourCount),
                      )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
