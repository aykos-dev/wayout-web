'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export const RAUSCH_ICON = L.divIcon({
  className: '',
  html:
    '<div style="background:#20B26B;color:#fff;width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;box-shadow:0 4px 8px rgba(0,0,0,.18),0 0 0 2px #fff inset"></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
