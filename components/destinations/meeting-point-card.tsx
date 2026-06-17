'use client';

import dynamic from 'next/dynamic';

const MeetingPointMap = dynamic(
  () => import('./meeting-point-map').then((m) => m.MeetingPointMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] w-full animate-pulse rounded-md bg-surface-soft" />
    ),
  },
);

interface Props {
  description: string | null;
  lat: number | null;
  lng: number | null;
  title: string;
}

export function MeetingPointCard({ description, lat, lng, title }: Props) {
  if (lat == null || lng == null) return null;
  return (
    <div className="rounded-md border border-hairline p-5">
      <h3 className="text-title-md text-ink">{title}</h3>
      {description && (
        <p className="mt-2 text-body-md text-body whitespace-pre-line">
          {description}
        </p>
      )}
      <div className="mt-4">
        <MeetingPointMap lat={lat} lng={lng} height={240} />
      </div>
    </div>
  );
}
