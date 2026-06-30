import { Footprints, Ruler, MapPin, Sun, Mountain, Navigation } from 'lucide-react';
import type { Place } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface Props {
  place: Place;
  dict: Dictionary;
}

export function PlaceKeyInfoBar({ place, dict }: Props) {
  const cells: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }> = [];

  if (place.difficulty) {
    cells.push({
      icon: <Footprints className="h-5 w-5" />,
      label: t(dict, 'tours', 'difficulty.label'),
      value: t(dict, 'tours', `difficulty.${place.difficulty}`),
    });
  }
  if (place.lengthKm) {
    cells.push({
      icon: <Ruler className="h-5 w-5" />,
      label: t(dict, 'tours', 'detail.distance'),
      value: `${Number(place.lengthKm)} km`,
    });
  }
  if (place.elevation != null) {
    cells.push({
      icon: <Mountain className="h-5 w-5" />,
      label: t(dict, 'destinations', 'detail.elevation'),
      value: `${place.elevation} m`,
    });
  }
  if (place.region) {
    cells.push({
      icon: <MapPin className="h-5 w-5" />,
      label: t(dict, 'destinations', 'detail.regionLabel'),
      value: place.region,
    });
  }
  if (place.address) {
    cells.push({
      icon: <Navigation className="h-5 w-5" />,
      label: t(dict, 'destinations', 'detail.address'),
      value: place.address,
    });
  }
  if (place.bestSeason) {
    cells.push({
      icon: <Sun className="h-5 w-5" />,
      label: t(dict, 'destinations', 'detail.bestSeason'),
      value: place.bestSeason,
    });
  }

  if (cells.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-y-4 border-y border-hairline py-6 sm:grid-cols-4">
      {cells.map((c, i) => (
        <Cell key={i} icon={c.icon} label={c.label} value={c.value} />
      ))}
    </ul>
  );
}

function Cell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 px-4">
      <span className="text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-caption-sm text-muted">{label}</p>
        <p className="text-title-sm text-ink line-clamp-1" title={value}>
          {value}
        </p>
      </div>
    </li>
  );
}
