import { getLangFromCookies } from '@/lib/i18n-server';
import { SettingsClient } from '@/features/settings/settings-client';

export default function SettingsPage() {
  const lang = getLangFromCookies();
  return <SettingsClient lang={lang} />;
}
