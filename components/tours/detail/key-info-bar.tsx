import { Clock, Users, Footprints, Ruler } from 'lucide-react';
import { durationDays, durationLabel } from '@/lib/utils';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface Props {
  tour: Tour;
  lang: Lang;
  dict: Dictionary;
}

export function KeyInfoBar({ tour, lang, dict }: Props) {
  const days = durationDays(tour.departureDate, tour.returnDate);
  return (
    <ul className="grid grid-cols-2 gap-y-4 border-y border-hairline py-6 sm:grid-cols-4">
      <Cell
        icon={<Clock className="h-5 w-5" />}
        label={t(dict, 'tours', 'detail.duration')}
        value={durationLabel(days, lang)}
      />
      <Cell
        icon={<Users className="h-5 w-5" />}
        label={t(dict, 'tours', 'detail.groupSize')}
        value={`${tour.seatsTotal}`}
      />
      {tour.place?.difficulty && (
        <Cell
          icon={<Footprints className="h-5 w-5" />}
          label={t(dict, 'tours', 'detail.duration')}
          value={t(dict, 'tours', `difficulty.${tour.place.difficulty}`)}
        />
      )}
      {tour.place?.lengthKm && (
        <Cell
          icon={<Ruler className="h-5 w-5" />}
          label={t(dict, 'tours', 'detail.distance')}
          value={`${Number(tour.place.lengthKm)} km`}
        />
      )}
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
      <div>
        <p className="text-caption-sm text-muted">{label}</p>
        <p className="text-title-sm text-ink">{value}</p>
      </div>
    </li>
  );
}
