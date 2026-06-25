'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { userApi, type NotificationPrefs } from '@/lib/api-client';
import { SettingGroup } from '@/components/settings/setting-group';
import { SettingRow } from '@/components/settings/setting-row';
import { Switch } from '@/components/ui/switch';

const ROWS: { key: keyof NotificationPrefs; label: string; help: string }[] = [
  { key: 'weekendDigest', label: 'Weekend digest', help: 'A weekly “trips this weekend” message.' },
  { key: 'savedTourAlerts', label: 'Saved-tour alerts', help: 'Price drops and low-seat warnings on tours you liked.' },
  { key: 'orgNewTour', label: 'New tours from operators', help: 'When an operator you follow publishes a new tour.' },
];

/** Server-backed Telegram notification preferences. */
export function NotificationsSection() {
  const auth = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    if (!auth.token) return;
    userApi.getNotificationPrefs().then(setPrefs).catch(() => undefined);
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
    <SettingGroup
      title="Notifications"
      description="Booking confirmations are always sent."
    >
      <SettingRow
        label="Pause all marketing messages"
        description="Mute digests and alerts without unlinking Telegram."
        onClick={() => update({ marketingOptOut: !muted })}
        disabled={!prefs}
        right={<Switch checked={muted} interactive={false} disabled={!prefs} />}
      />
      {ROWS.map((r) => {
        const checked = !!prefs?.[r.key] && !muted;
        return (
          <SettingRow
            key={r.key}
            label={r.label}
            description={r.help}
            onClick={() =>
              update({ [r.key]: !prefs?.[r.key] } as Partial<NotificationPrefs>)
            }
            disabled={!prefs || muted}
            right={
              <Switch checked={checked} interactive={false} disabled={!prefs || muted} />
            }
          />
        );
      })}
    </SettingGroup>
  );
}
