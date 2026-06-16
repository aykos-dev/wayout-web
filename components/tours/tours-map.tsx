'use client';

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { ensureLeafletIcons, RAUSCH_ICON } from './leaflet-fix';

ensureLeafletIcons();

const FALLBACK_CENTER: LatLngTuple = [41.311248, 69.281838];

interface Props {
  tours: Tour[];
  highlightId?: string | null;
}

function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(FALLBACK_CENTER, 7);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
  }, [points, map]);
  return null;
}

export function ToursMap({ tours, highlightId }: Props) {
  const points = useMemo<LatLngTuple[]>(
    () =>
      tours
        .filter((t) => t.meetingPointLat && t.meetingPointLng)
        .map((t) => [Number(t.meetingPointLat), Number(t.meetingPointLng)]),
    [tours],
  );
  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-hairline">
      <MapContainer
        center={FALLBACK_CENTER}
        zoom={7}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tours.map((tour) =>
          tour.meetingPointLat && tour.meetingPointLng ? (
            <Marker
              key={tour.id}
              position={[
                Number(tour.meetingPointLat),
                Number(tour.meetingPointLng),
              ]}
              icon={RAUSCH_ICON}
              eventHandlers={{
                click: () => undefined,
              }}
              opacity={highlightId && highlightId !== tour.id ? 0.6 : 1}
            >
              <Popup>
                <Link
                  href={`/tours/${tour.slug}`}
                  className="text-title-sm text-ink hover:underline"
                >
                  {tour.title}
                </Link>
                <div className="text-body-sm text-muted">
                  {tour.destination}
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
