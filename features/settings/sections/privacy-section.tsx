'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { SettingGroup } from '@/components/settings/setting-group';
import { SettingRow } from '@/components/settings/setting-row';
import { Switch } from '@/components/ui/switch';

/** Leaderboard visibility opt-out. */
export function PrivacySection() {
  const auth = useAuth();
  const [hidden, setHidden] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth.token) return;
    userApi
      .getLeaderboardPrivacy()
      .then((r) => setHidden(r.hiddenFromLeaderboard))
      .catch(() => setHidden(false));
  }, [auth.token]);

  if (!auth.token) return null;

  async function toggle() {
    if (hidden === null) return;
    const next = !hidden;
    setHidden(next); // optimistic
    try {
      await userApi.setLeaderboardPrivacy(next);
    } catch {
      setHidden(!next);
    }
  }

  return (
    <SettingGroup title="Privacy">
      <SettingRow
        label="Hide me from Top Travelers"
        description="You won't appear in public leaderboards. Your profile stays reachable by direct link."
        onClick={toggle}
        disabled={hidden === null}
        right={<Switch checked={!!hidden} interactive={false} disabled={hidden === null} />}
      />
    </SettingGroup>
  );
}
