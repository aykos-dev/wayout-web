'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { bootAnalytics, setAnalyticsLang, setAnalyticsUser, track } from '@/lib/analytics';
import { useAuth } from '@/lib/auth';
import type { Lang } from '@/lib/i18n';

interface Props {
  lang: Lang;
}

export function FirebaseAnalytics({ lang }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    setAnalyticsLang(lang);
    bootAnalytics();
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      track('session_start', {
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      });
    }
    const onUnload = () => track('session_end');
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [lang]);

  useEffect(() => {
    const next = auth.user?.id ?? null;
    if (lastUserIdRef.current === next) return;
    lastUserIdRef.current = next;
    setAnalyticsUser(next ? { id: next, lang } : null);
  }, [auth.user, lang]);

  useEffect(() => {
    if (!pathname) return;
    const search = searchParams?.toString() ?? '';
    track('page_view', {
      page_path: pathname,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      search: search || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}
