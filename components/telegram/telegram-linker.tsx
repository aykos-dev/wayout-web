'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { getTelegramWebApp } from '@/lib/telegram';

const LINKED_KEY = 'booktrip.tg.linked';

/**
 * When the site runs inside the Telegram Mini App, this:
 *  1. tells Telegram the app is ready and expands the viewport, and
 *  2. once the user is signed in (phone login stays primary), silently links
 *     their Telegram account so the bot can DM them. Renders nothing.
 */
export function TelegramLinker() {
  const { token } = useAuth();
  const attempted = useRef(false);

  useEffect(() => {
    const wa = getTelegramWebApp();
    if (!wa) return;
    try {
      wa.ready();
      wa.expand();
    } catch {
      /* not fatal */
    }
  }, []);

  useEffect(() => {
    const wa = getTelegramWebApp();
    if (!wa?.initData || !token || attempted.current) return;
    if (localStorage.getItem(LINKED_KEY) === '1') return;
    attempted.current = true;
    userApi
      .linkTelegram(wa.initData)
      .then(() => localStorage.setItem(LINKED_KEY, '1'))
      .catch(() => {
        // Allow a retry on the next session/login.
        attempted.current = false;
      });
  }, [token]);

  return null;
}
