'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';

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

/**
 * Lets a user opt out of public leaderboards / top-traveler lists. Their own
 * profile remains viewable; they're just excluded from the ranked lists.
 */
export function LeaderboardPrivacyCard() {
  const auth = useAuth();
  const [hidden, setHidden] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth.token) return;
    userApi
      .getLeaderboardPrivacy()
      .then((r) => setHidden(r.hiddenFromLeaderboard))
      .catch(() => setHidden(false));
  }, [auth.token]);

  if (!auth.token) return null;

  async function toggle() {
    if (hidden === null || saving) return;
    const next = !hidden;
    setHidden(next); // optimistic
    setSaving(true);
    try {
      await userApi.setLeaderboardPrivacy(next);
    } catch {
      setHidden(!next); // revert
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="text-display-sm text-ink">Privacy</h2>
      <p className="mt-1 text-body-sm text-muted">
        Control where you appear on Outway.
      </p>
      <div className="mt-4 rounded-md border border-hairline">
        <label className="flex items-center justify-between px-4 py-3.5">
          <span>
            <span className="block text-body-md text-ink">
              Hide me from Top Travelers
            </span>
            <span className="block text-caption text-muted">
              You won&apos;t appear in public leaderboards. Your profile stays
              reachable by direct link.
            </span>
          </span>
          <Toggle
            checked={!!hidden}
            disabled={hidden === null || saving}
            onClick={toggle}
          />
        </label>
      </div>
    </section>
  );
}
