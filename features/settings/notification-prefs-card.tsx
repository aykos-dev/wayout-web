'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { userApi, type NotificationPrefs } from '@/lib/api-client';

const ROWS: { key: keyof NotificationPrefs; label: string; help: string }[] = [
  {
    key: 'weekendDigest',
    label: 'Weekend digest',
    help: 'A weekly “trips this weekend” message.',
  },
  {
    key: 'savedTourAlerts',
    label: 'Saved-tour alerts',
    help: 'Price drops and low-seat warnings on tours you liked.',
  },
  {
    key: 'orgNewTour',
    label: 'New tours from operators',
    help: 'When an operator you engaged with publishes a new tour.',
  },
];

function Toggle({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ' +
        (disabled ? 'cursor-not-allowed opacity-40 ' : 'cursor-pointer ') +
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
  );
}

/** Server-backed Telegram notification preferences. Renders only when signed in. */
export function NotificationPrefsCard() {
  const auth = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    if (!auth.token) return;
    userApi
      .getNotificationPrefs()
      .then(setPrefs)
      .catch(() => undefined);
  }, [auth.token]);

  if (!auth.token) return null;

  async function update(patch: Partial<NotificationPrefs>) {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, ...patch }); // optimistic
    try {
      setPrefs(await userApi.setNotificationPrefs(patch));
    } catch {
      setPrefs(prev);
    }
  }

  const muted = prefs?.marketingOptOut ?? false;

  return (
    <section className="mt-12 pb-16">
      <h2 className="text-display-sm text-ink">Telegram notifications</h2>
      <p className="mt-1 text-body-sm text-muted">
        Choose which messages the bot sends you. Booking confirmations are
        always sent.
      </p>

      <div className="mt-4 divide-y divide-hairline rounded-md border border-hairline">
        {/* Master pause */}
        <label className="flex cursor-pointer items-center justify-between px-4 py-3.5">
          <span>
            <span className="block text-body-md text-ink">
              Pause all marketing messages
            </span>
            <span className="block text-caption text-muted">
              Mute digests and alerts without unlinking Telegram.
            </span>
          </span>
          <Toggle
            checked={muted}
            disabled={!prefs}
            onClick={() => update({ marketingOptOut: !muted })}
          />
        </label>

        {ROWS.map((row) => {
          const checked = !!prefs?.[row.key] && !muted;
          return (
            <label
              key={row.key}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <span>
                <span className="block text-body-md text-ink">{row.label}</span>
                <span className="block text-caption text-muted">{row.help}</span>
              </span>
              <Toggle
                checked={checked}
                disabled={!prefs || muted}
                onClick={() => update({ [row.key]: !prefs?.[row.key] })}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
