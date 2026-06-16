import { format } from 'date-fns';
import { durationDays } from '@/lib/utils';
import type { Tour } from '@/lib/types';

interface Props {
  tour: Tour;
  title: string;
}

export function ItineraryTimeline({ tour, title }: Props) {
  const days = durationDays(tour.departureDate, tour.returnDate);
  const explicit = tour.itinerary ?? [];

  // If the operator hasn't provided an itinerary yet, fall back to a minimal
  // skeleton built from the trip's actual start/end dates — never hardcoded.
  const items =
    explicit.length > 0
      ? explicit
      : Array.from({ length: days }).map((_, i) => ({
          day: i + 1,
          title:
            i === 0
              ? `Depart from ${tour.meetingPointDescription ?? 'meeting point'}`
              : i === days - 1
                ? 'Return'
                : `Day ${i + 1}`,
          body: '',
        }));

  return (
    <div>
      <h3 className="text-display-sm text-ink">{title}</h3>
      <ol className="mt-4 space-y-4">
        {items.map((step, i) => {
          const d = new Date(tour.departureDate);
          d.setDate(d.getDate() + (step.day - 1));
          return (
            <li key={`${step.day}-${i}`} className="flex gap-4">
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-caption text-white">
                {step.day}
              </span>
              <div>
                <p className="text-title-sm text-ink">
                  Day {step.day} — {format(d, 'EEE, MMM d')}: {step.title}
                </p>
                {step.body && (
                  <p className="text-body-md text-body whitespace-pre-line">
                    {step.body}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
