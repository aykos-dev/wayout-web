'use client';

import { useState } from 'react';
import { Check, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { trackEvent } from '@/lib/analytics-events';

interface Props {
  tourId: string;
  selectedDepartureDate?: string;
  label?: string;
  successLabel?: string;
}

export function ExpressInterestButton({
  tourId,
  selectedDepartureDate,
  label = "I'm interested",
  successLabel = 'Interest sent — the operator will confirm',
}: Props) {
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    track('tour_express_interest_click', {
      tour_id: tourId,
      date: selectedDepartureDate,
    });
    if (!auth.token) {
      track('auth_modal_open', { trigger: 'interest', tour_id: tourId });
      try {
        await auth.requestLogin();
      } catch {
        return;
      }
    }
    setSubmitting(true);
    try {
      await userApi.expressInterest(tourId, selectedDepartureDate);
      track('tour_express_interest_success', {
        tour_id: tourId,
        date: selectedDepartureDate,
      });
      // Growth-funnel signal (open → view → save → interest → join).
      trackEvent('tour_interest', { tourId, date: selectedDepartureDate });
      setDone(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to send interest';
      track('tour_express_interest_fail', {
        tour_id: tourId,
        reason: message,
      });
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 rounded-md bg-rausch-50 px-3 py-2 text-sm text-rausch-700">
        <Check className="size-4" />
        {successLabel}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        onClick={submit}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 size-4" />
        )}
        {label}
      </Button>
      {error && <p className="text-xs text-rausch-700">{error}</p>}
    </div>
  );
}
