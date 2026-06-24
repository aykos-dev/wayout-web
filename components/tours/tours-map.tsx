'use client';

import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { ensureLeafletIcons, TOUR_MARKER_ICON } from './leaflet-fix';
import { MapTileLayers } from './map-tile-layers';
import { track } from '@/lib/analytics';

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
        <MapTileLayers />
        {tours.map((tour) =>
          tour.meetingPointLat && tour.meetingPointLng ? (
            <Marker
              key={tour.id}
              position={[
                Number(tour.meetingPointLat),
                Number(tour.meetingPointLng),
              ]}
              icon={TOUR_MARKER_ICON}
              eventHandlers={{
                click: () =>
                  track('tours_map_marker_click', {
                    tour_id: tour.id,
                    slug: tour.slug,
                  }),
              }}
              opacity={highlightId && highlightId !== tour.id ? 0.6 : 1}
            >
              <Popup>
                <Link
                  href={`/tours/${tour.slug}`}
                  onClick={() =>
                    track('select_content', {
                      content_type: 'tour',
                      item_id: tour.id,
                      slug: tour.slug,
                      list_context: 'tours_map_popup',
                    })
                  }
                  className="text-title-sm text-ink hover:underline"
                >
                  {tour.title ?? tour.place?.name ?? 'Tour'}
                </Link>
                <div className="text-body-sm text-muted">
                  {tour.place?.region ?? tour.place?.name}
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
