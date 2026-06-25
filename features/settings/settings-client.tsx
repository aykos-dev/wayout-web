'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { useAuth, getStoredToken } from '@/lib/auth';
import { track } from '@/lib/analytics';
import { SettingGroup } from '@/components/settings/setting-group';
import { SettingRow } from '@/components/settings/setting-row';
import { AccountSection } from './sections/account-section';
import { PreferencesSection } from './sections/preferences-section';
import { NotificationsSection } from './sections/notifications-section';
import { PrivacySection } from './sections/privacy-section';

export function SettingsClient({ lang }: { lang: Lang }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only prompt login when truly signed out. After a reload (e.g. language
    // change) the auth context hasn't hydrated `token` from localStorage yet,
    // so check storage synchronously to avoid a spurious login sheet.
    if (!auth.token && !getStoredToken()) {
      void auth.requestLogin().catch(() => router.push('/'));
    }
  }, [auth, router]);

  if (!auth.token && !getStoredToken()) {
    return (
      <div className="container-airbnb py-20 text-center text-body-md text-muted">
        Please sign in.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-8 sm:py-10">
      <h1 className="text-display-lg text-ink">Settings</h1>

      <AccountSection lang={lang} />
      <PreferencesSection />
      <NotificationsSection />
      <PrivacySection />

      <SettingGroup>
        <SettingRow
          label="Sign out"
          destructive
          onClick={() => {
            track('logout');
            auth.logout();
            router.push('/');
          }}
          right={<LogOut className="size-4 text-error-text" />}
        />
      </SettingGroup>
    </div>
  );
}
