'use client';

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Place } from '@/lib/types';
import { ensureLeafletIcons, RAUSCH_ICON } from '@/components/tours/leaflet-fix';

ensureLeafletIcons();

const FALLBACK_CENTER: LatLngTuple = [41.311248, 69.281838];

interface Props {
  places: Place[];
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

export function DestinationsMap({ places, highlightId }: Props) {
  const points = useMemo<LatLngTuple[]>(
    () =>
      places
        .filter((p) => p.meetingPointLat && p.meetingPointLng)
        .map((p) => [
          Number(p.meetingPointLat),
          Number(p.meetingPointLng),
        ]),
    [places],
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
        {places.map((place) =>
          place.meetingPointLat && place.meetingPointLng ? (
            <Marker
              key={place.id}
              position={[
                Number(place.meetingPointLat),
                Number(place.meetingPointLng),
              ]}
              icon={RAUSCH_ICON}
              opacity={highlightId && highlightId !== place.id ? 0.6 : 1}
            >
              <Popup>
                <Link
                  href={`/destinations/${place.slug}`}
                  className="text-title-sm text-ink hover:underline"
                >
                  {place.name}
                </Link>
                {place.region && (
                  <div className="text-body-sm text-muted">{place.region}</div>
                )}
              </Popup>
            </Marker>
          ) : null,
        )}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
