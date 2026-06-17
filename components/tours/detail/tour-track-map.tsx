'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcons, RAUSCH_ICON } from '../leaflet-fix';
import { fetchAndParseGpx, type LatLng } from '@/lib/gpx';

ensureLeafletIcons();

interface Props {
  gpxUrl?: string | null;
  meetingLat?: number | null;
  meetingLng?: number | null;
  height?: number;
  description?: string | null;
  title?: string;
}

function FitToBounds({ track }: { track: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (track.length < 2) return;
    map.fitBounds(L.polyline(track).getBounds(), { padding: [24, 24] });
  }, [track, map]);
  return null;
}

export function TourTrackMap({
  gpxUrl,
  meetingLat,
  meetingLng,
  height = 360,
  description,
  title,
}: Props) {
  const [track, setTrack] = useState<LatLng[]>([]);

  useEffect(() => {
    setTrack([]);
    if (!gpxUrl) return;
    fetchAndParseGpx(gpxUrl).then(setTrack).catch(() => setTrack([]));
  }, [gpxUrl]);

  const center: LatLngTuple =
    track.length > 0
      ? track[0]
      : meetingLat != null && meetingLng != null
        ? [meetingLat, meetingLng]
        : [41.311299, 69.281703];

  return (
    <div>
      {title && <h3 className="text-display-sm text-ink">{title}</h3>}
      <div
        className="mt-4 overflow-hidden rounded-md border border-hairline"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {meetingLat != null && meetingLng != null && (
            <Marker
              position={[meetingLat, meetingLng]}
              icon={RAUSCH_ICON}
            />
          )}
          {track.length > 1 && (
            <Polyline
              positions={track}
              pathOptions={{ color: '#20B26B', weight: 4 }}
            />
          )}
          <FitToBounds track={track} />
        </MapContainer>
      </div>
      {description && (
        <p className="mt-3 text-body-md text-body whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );
}
