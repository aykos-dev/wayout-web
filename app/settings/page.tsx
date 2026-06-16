import { getDict } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { SettingsClient } from '@/features/settings/settings-client';

export default function SettingsPage() {
  const lang = getLangFromCookies();
  const dict = getDict(lang);
  return <SettingsClient lang={lang} dict={dict} />;
}
