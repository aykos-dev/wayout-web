import { getDict } from '@/lib/i18n';
import { getLangFromCookies } from '@/lib/i18n-server';
import { MyTripsClient } from '@/features/me/my-trips-client';

export default function MePage() {
  const lang = getLangFromCookies();
  const dict = getDict(lang);
  return <MyTripsClient lang={lang} dict={dict} />;
}
