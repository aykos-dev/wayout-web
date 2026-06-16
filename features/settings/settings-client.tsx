'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary, Lang } from '@/lib/i18n';
import type { DestinationCategory } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { usePreferences } from '@/lib/preferences';
import { Button } from '@/components/ui/button';

const ALL_CATEGORIES: DestinationCategory[] = [
  'waterfall',
  'peak',
  'lake',
  'canyon',
  'cave',
];

const CATEGORY_LABELS: Record<DestinationCategory, string> = {
  waterfall: 'Waterfall',
  peak: 'Peak',
  lake: 'Lake',
  canyon: 'Canyon',
  cave: 'Cave',
};

const NOTIFICATION_LABELS: Record<string, string> = {
  priceChanged: 'Price changed',
  seatsUpdated: 'Seats updated',
  tourCancelled: 'Tour cancelled',
  savedSearchAlerts: 'Saved search alerts',
};

const BUDGET_MAX = 10_000_000;
const BUDGET_STEP = 100_000;

export function SettingsClient({
  lang,
  dict,
}: {
  lang: Lang;
  dict: Dictionary;
}) {
  const auth = useAuth();
  const router = useRouter();

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preferences store
  const prefs = usePreferences();

  // Hydrate preferences on mount
  useEffect(() => {
    prefs.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth gate
  useEffect(() => {
    if (!auth.token) {
      void auth.requestLogin().catch(() => router.push('/'));
    }
  }, [auth, router]);

  // Populate profile fields from auth user
  useEffect(() => {
    if (auth.user) {
      setFullName(auth.user.fullName ?? '');
      setPhone(auth.user.phone ?? '');
      setEmail(auth.user.email ?? '');
    }
  }, [auth.user]);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await userApi.updateProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      auth.setSession(auth.token!, updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: DestinationCategory) {
    const current = prefs.categories;
    if (current.includes(cat)) {
      prefs.setCategories(current.filter((c: DestinationCategory) => c !== cat));
    } else {
      prefs.setCategories([...current, cat]);
    }
  }

  if (!auth.token) {
    return (
      <div className="container-airbnb py-20 text-center text-body-md text-muted">
        Please sign in.
      </div>
    );
  }

  return (
    <div className="container-airbnb py-12">
      <h1 className="text-display-lg text-ink">Settings</h1>

      {/* ── Profile ── */}
      <section className="mt-10">
        <h2 className="text-display-sm text-ink">Profile</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Full name */}
          <label className="block">
            <span className="text-body-sm text-muted">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-hairline bg-white px-3 py-2.5 text-body-md text-ink outline-none transition-colors focus:border-ink"
            />
          </label>

          {/* Phone */}
          <label className="block">
            <span className="text-body-sm text-muted">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-hairline bg-white px-3 py-2.5 text-body-md text-ink outline-none transition-colors focus:border-ink"
            />
          </label>

          {/* Email */}
          <label className="block sm:col-span-2">
            <span className="text-body-sm text-muted">
              Email <span className="text-caption text-muted">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-hairline bg-white px-3 py-2.5 text-body-md text-ink outline-none transition-colors focus:border-ink"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saveSuccess && (
            <span className="text-body-sm text-green-600">Saved!</span>
          )}
          {saveError && (
            <span className="text-body-sm text-red-600">{saveError}</span>
          )}
        </div>
      </section>

      {/* ── Category preferences ── */}
      <section className="mt-12">
        <h2 className="text-display-sm text-ink">Category preferences</h2>
        <p className="mt-1 text-body-sm text-muted">
          Choose the destination types you are interested in.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const active = prefs.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={
                  'rounded-full border px-4 py-2 text-body-sm font-medium transition-colors ' +
                  (active
                    ? 'border-ink bg-ink text-white'
                    : 'border-hairline bg-white text-ink hover:bg-surface-strong')
                }
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Max budget ── */}
      <section className="mt-12">
        <h2 className="text-display-sm text-ink">Max budget</h2>
        <p className="mt-1 text-body-sm text-muted">
          Set your maximum budget for tours.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={prefs.maxBudget}
            onChange={(e) => prefs.setBudget(Number(e.target.value))}
            className="h-2 w-full max-w-md cursor-pointer appearance-none rounded-full bg-surface-strong accent-ink"
          />
          <div className="flex items-baseline gap-1.5">
            <input
              type="number"
              min={0}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={prefs.maxBudget}
              onChange={(e) => prefs.setBudget(Number(e.target.value))}
              className="w-36 rounded-sm border border-hairline bg-white px-3 py-2 text-body-md text-ink outline-none transition-colors focus:border-ink"
            />
            <span className="text-body-sm text-muted">UZS</span>
          </div>
        </div>
      </section>

      {/* ── Notification preferences ── */}
      <section className="mt-12 pb-16">
        <h2 className="text-display-sm text-ink">Notifications</h2>
        <p className="mt-1 text-body-sm text-muted">
          Choose which notifications you want to receive.
        </p>

        <div className="mt-4 divide-y divide-hairline rounded-md border border-hairline">
          {(
            Object.keys(NOTIFICATION_LABELS) as Array<
              keyof typeof NOTIFICATION_LABELS
            >
          ).map((key) => {
            const notifKey =
              key as keyof typeof prefs.notifications;
            const checked = prefs.notifications[notifKey];
            return (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors hover:bg-surface-strong"
              >
                <span className="text-body-md text-ink">
                  {NOTIFICATION_LABELS[key]}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={checked}
                  onClick={() =>
                    prefs.setNotification(notifKey, !checked)
                  }
                  className={
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ' +
                    (checked ? 'bg-ink' : 'bg-surface-strong')
                  }
                >
                  <span
                    className={
                      'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ' +
                      (checked ? 'translate-x-6' : 'translate-x-1')
                    }
                  />
                </button>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
