'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerPng from '@/assets/marker.png';

const MARKER_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let patched = false;
export function ensureLeafletIcons() {
  if (patched) return;
  patched = true;
  L.Icon.Default.mergeOptions({
    iconUrl: MARKER_URL,
    iconRetinaUrl: MARKER_2X,
    shadowUrl: SHADOW,
  });
}

// The marker.png has transparent padding below the visible pin tip — the
// drawn tip ends at roughly y=1380 of the 1536-tall canvas (~90%). Anchor the
// icon at 90% of the rendered height so the tip lands exactly on the lat/lng
// at every zoom level. Without this, the tip floats above the true point and
// the offset grows visibly large when zoomed out.
const ICON_W = 32;
const ICON_H = 48;
const TIP_Y = Math.round(ICON_H * 0.9);

export const TOUR_MARKER_ICON = L.icon({
  iconUrl: markerPng.src,
  iconRetinaUrl: markerPng.src,
  iconSize: [ICON_W, ICON_H],
  iconAnchor: [ICON_W / 2, TIP_Y],
  popupAnchor: [0, -TIP_Y],
});
