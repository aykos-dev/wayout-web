'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ExpressInterestButton } from './express-interest-button';
import type { Dictionary } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface DatePair {
  departureDate: string;
  returnDate: string;
}

interface Props {
  tourId: string;
  dates: DatePair[];
  fallbackDeparture: string;
  fallbackReturn: string;
  dict: Dictionary;
}

export function DateSelector({
  tourId,
  dates,
  fallbackDeparture,
  fallbackReturn,
  dict,
}: Props) {
  const options = useMemo<DatePair[]>(() => {
    const list = dates.length > 0
      ? dates
      : [{ departureDate: fallbackDeparture, returnDate: fallbackReturn }];
    return [...list].sort(
      (a, b) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime(),
    );
  }, [dates, fallbackDeparture, fallbackReturn]);

  const [selected, setSelected] = useState(options[0].departureDate);

  if (options.length === 1) {
    return <ExpressInterestButton tourId={tourId} />;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-caption-sm text-muted">
          {t(dict, 'tours', 'detail.selectDate')}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = opt.departureDate === selected;
            return (
              <button
                key={opt.departureDate}
                type="button"
                onClick={() => {
                  track('tour_date_select', {
                    tour_id: tourId,
                    date: opt.departureDate,
                  });
                  setSelected(opt.departureDate);
                }}
                aria-pressed={active}
                className={
                  'rounded-full border px-3 py-1.5 text-sm transition ' +
                  (active
                    ? 'border-ink bg-ink text-white'
                    : 'border-hairline text-ink hover:border-ink')
                }
              >
                {format(new Date(opt.departureDate), 'MMM d')}
              </button>
            );
          })}
        </div>
      </div>
      <ExpressInterestButton
        tourId={tourId}
        selectedDepartureDate={selected}
      />
    </div>
  );
}
