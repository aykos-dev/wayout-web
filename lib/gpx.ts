import { gpx as gpxToGeoJSON } from '@tmcw/togeojson';

export type LatLng = [number, number];

export function parseGpxToLatLngs(gpxText: string): LatLng[] {
  const xml = new DOMParser().parseFromString(gpxText, 'application/xml');
  const geojson = gpxToGeoJSON(xml) as GeoJSON.FeatureCollection;
  for (const feat of geojson.features ?? []) {
    const geom = feat.geometry;
    if (!geom) continue;
    if (geom.type === 'LineString') {
      return geom.coordinates.map(([lng, lat]) => [lat, lng] as LatLng);
    }
    if (geom.type === 'MultiLineString') {
      return geom.coordinates
        .flat()
        .map(([lng, lat]) => [lat, lng] as LatLng);
    }
  }
  return [];
}

export async function fetchAndParseGpx(url: string): Promise<LatLng[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch GPX: ${res.status}`);
  return parseGpxToLatLngs(await res.text());
}
