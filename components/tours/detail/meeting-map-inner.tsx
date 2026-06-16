'use client';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { ensureLeafletIcons, RAUSCH_ICON } from '../leaflet-fix';

ensureLeafletIcons();

export function MeetingMapInner({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={RAUSCH_ICON} />
    </MapContainer>
  );
}
