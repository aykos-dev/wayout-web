'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const InnerMap = dynamic(() => import('./meeting-map-inner').then((m) => m.MeetingMapInner), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-md bg-surface-soft" />,
});

interface Props {
  lat: number;
  lng: number;
  description: string | null;
  title: string;
}

export function MeetingMap({ lat, lng, description, title }: Props) {
  return (
    <div>
      <h3 className="text-display-sm text-ink">{title}</h3>
      {description && (
        <p className="mt-2 flex items-start gap-2 text-body-md text-body">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          {description}
        </p>
      )}
      <div className="mt-4 h-72 overflow-hidden rounded-md border border-hairline">
        <InnerMap lat={lat} lng={lng} />
      </div>
    </div>
  );
}
