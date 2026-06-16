'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import type { Tour } from '@/lib/types';
import type { Dictionary, Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { PriceTag } from '../price-tag';

type Stage = 'idle' | 'confirm' | 'pending' | 'success' | 'error';

interface Props {
  tour: Tour;
  lang: Lang;
  dict: Dictionary;
  buttonClassName?: string;
}

export function BookingFlow({ tour, lang, dict, buttonClassName }: Props) {
  const auth = useAuth();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const tourDates =
    tour.dates && tour.dates.length > 0
      ? tour.dates
      : [{ departureDate: tour.departureDate, returnDate: tour.returnDate }];
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const selectedDate = tourDates[selectedDateIdx];

  const start = async () => {
    setError(null);
    if (!auth.user) {
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setStage('confirm');
  };

  const confirm = async () => {
    setStage('pending');
    try {
      await userApi.expressInterest(
        tour.id,
        tourDates.length > 1 ? selectedDate.departureDate : undefined,
      );
      setStage('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setStage('error');
    }
  };

  const soldOut = tour.seatsAvailable === 0;

  return (
    <>
      <Button
        className={buttonClassName}
        disabled={soldOut}
        onClick={start}
      >
        {soldOut
          ? t(dict, 'tours', 'card.soldOut')
          : t(dict, 'tours', 'detail.expressInterest')}
      </Button>

      <Dialog
        open={stage !== 'idle'}
        onOpenChange={(o) => !o && setStage('idle')}
      >
        <DialogContent className="sm:max-w-md">
          {(stage === 'confirm' || stage === 'pending') && (
            <>
              <h2 className="text-display-sm text-ink">
                {t(dict, 'tours', 'detail.bookingTitle')}
              </h2>
              <p className="mt-1 text-body-sm text-muted">
                Confirm your interest. An operator will call you to finalize.
              </p>

              {tourDates.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tourDates.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDateIdx(i)}
                      className={
                        'rounded-full border px-3 py-1.5 text-body-sm font-medium transition-colors ' +
                        (i === selectedDateIdx
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-hairline text-muted hover:border-ink/30')
                      }
                    >
                      {format(new Date(d.departureDate), 'PP')}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2 rounded-md border border-hairline p-4 text-body-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted" />
                  {format(new Date(selectedDate.departureDate), 'PP')} →{' '}
                  {format(new Date(selectedDate.returnDate), 'PP')}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted" />
                  {tour.seatsAvailable} / {tour.seatsTotal} seats
                </div>
                <div>
                  <PriceTag
                    amount={tour.finalPriceAmount}
                    currency={tour.priceCurrency}
                    perPerson={t(dict, 'tours', 'card.perPerson')}
                    lang={lang}
                    size="sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setStage('idle')}
                >
                  Cancel
                </Button>
                <Button disabled={stage === 'pending'} onClick={confirm}>
                  {stage === 'pending' ? 'Sending…' : 'Confirm'}
                </Button>
              </div>
            </>
          )}

          {stage === 'success' && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-4 text-display-sm text-ink">
                {t(dict, 'tours', 'detail.interestSent')}
              </h2>
              <p className="mt-2 text-body-md text-muted">
                Our operators will contact you shortly on the phone you signed
                in with.
              </p>
              <Button
                className="mt-6 w-full"
                onClick={() => setStage('idle')}
              >
                OK
              </Button>
            </div>
          )}

          {stage === 'error' && (
            <div>
              <h2 className="text-display-sm text-ink">Something went wrong</h2>
              <p className="mt-2 text-body-sm text-error-text">{error}</p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setStage('idle')}>
                  Close
                </Button>
                <Button onClick={() => setStage('confirm')}>Try again</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
