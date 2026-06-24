'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary, Lang } from '@/lib/i18n';
import type { DestinationCategory } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { usePreferences } from '@/lib/preferences';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { NotificationPrefsCard } from './notification-prefs-card';
import { LeaderboardPrivacyCard } from './leaderboard-privacy-card';

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
    const fields = [
      fullName.trim() ? 'fullName' : null,
      phone.trim() ? 'phone' : null,
      email.trim() ? 'email' : null,
    ].filter(Boolean) as string[];
    try {
      const updated = await userApi.updateProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      auth.setSession(auth.token!, updated);
      track('settings_save', { fields });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      track('settings_save_fail', { fields, reason: message });
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: DestinationCategory) {
    const current = prefs.categories;
    const next = current.includes(cat)
      ? current.filter((c: DestinationCategory) => c !== cat)
      : [...current, cat];
    track('preferences_categories_update', { categories: next });
    prefs.setCategories(next);
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

      {/* ── Telegram notification preferences (server-backed) ── */}
      <NotificationPrefsCard />

      {/* ── Leaderboard privacy ── */}
      <LeaderboardPrivacyCard />
    </div>
  );
}
