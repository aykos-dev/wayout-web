import type { ItineraryDay } from '@/lib/types';

interface Props {
  items: ItineraryDay[] | null | undefined;
  title: string;
}

export function PlaceItineraryTimeline({ items, title }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="text-display-sm text-ink">{title}</h3>
      <ol className="mt-4 space-y-4">
        {items.map((step, i) => (
          <li key={`${step.day}-${i}`} className="flex gap-4">
            <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-caption text-white">
              {step.day}
            </span>
            <div>
              <p className="text-title-sm text-ink">
                Day {step.day}: {step.title}
              </p>
              {step.body && (
                <p className="text-body-md text-body whitespace-pre-line">
                  {step.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
