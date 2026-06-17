'use client';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { ensureLeafletIcons, RAUSCH_ICON } from '@/components/tours/leaflet-fix';

ensureLeafletIcons();

interface Props {
  lat: number;
  lng: number;
  height?: number;
}

export function MeetingPointMap({ lat, lng, height = 240 }: Props) {
  const center: LatLngTuple = [lat, lng];
  return (
    <div
      className="overflow-hidden rounded-md border border-hairline"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={RAUSCH_ICON} />
      </MapContainer>
    </div>
  );
}
