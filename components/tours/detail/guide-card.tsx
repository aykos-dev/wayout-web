'use client';

import Link from 'next/link';
import { ShieldCheck, Phone, Mail, ChevronRight } from 'lucide-react';
import { track } from '@/lib/analytics';

interface Props {
  orgId: string;
  orgName: string;
  orgLogo?: string | null;
  contactInfo: string | null;
  title: string;
}

export function GuideCard({
  orgId,
  orgName,
  orgLogo,
  contactInfo,
  title,
}: Props) {
  return (
    <Link
      href={`/organizations/${orgId}`}
      onClick={() => track('tour_guide_click', { org_id: orgId })}
      className="group block rounded-md border border-hairline p-6 transition-colors hover:border-ink"
    >
      <h3 className="text-display-sm text-ink">{title}</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-surface-strong">
          {orgLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={orgLogo}
              alt={orgName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-title-md text-muted">
              {orgName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-title-md text-ink group-hover:underline">
            {orgName}
          </p>
          <p className="inline-flex items-center gap-1 text-body-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Verified operator
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-soft transition-transform group-hover:translate-x-1" />
      </div>
      {contactInfo && (
        <p className="mt-4 flex items-center gap-2 text-body-sm text-body">
          {contactInfo.includes('@') ? (
            <Mail className="h-4 w-4 text-muted" />
          ) : (
            <Phone className="h-4 w-4 text-muted" />
          )}
          {contactInfo}
        </p>
      )}
    </Link>
  );
}
