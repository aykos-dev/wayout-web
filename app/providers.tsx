'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { AuthModalHost } from '@/components/auth/auth-modal';
import { TelegramLinker } from '@/components/telegram/telegram-linker';
import { StartParamRouter } from '@/components/telegram/start-param-router';
import { ActivityTracker } from '@/components/analytics/activity-tracker';
import { usePreferences } from '@/lib/preferences';

function PreferencesHydrator() {
  const hydrate = usePreferences((s) => s.hydrate);
  useEffect(() => void hydrate(), [hydrate]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
        },
      }),
  );
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <PreferencesHydrator />
        <TelegramLinker />
        <StartParamRouter />
        <ActivityTracker />
        {children}
        <AuthModalHost />
      </AuthProvider>
    </QueryClientProvider>
  );
}
