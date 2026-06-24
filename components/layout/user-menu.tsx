'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const auth = useAuth();
  const router = useRouter();

  if (!auth.user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          track('auth_modal_open', { trigger: 'header_sign_in' });
          auth.requestLogin().catch(() => undefined);
        }}
      >
        <User className="mr-2 h-4 w-4" />
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-strong text-caption-sm text-ink">
            {(auth.user.fullName ?? '?')
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <span className="hidden sm:inline">
            {auth.user.fullName ?? auth.user.phone}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href="/me"
            onClick={() => track('nav_click', { target: '/me', label: 'my_trips' })}
          >
            My trips
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            onClick={() => track('nav_click', { target: '/settings', label: 'settings' })}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            track('logout');
            auth.logout();
            router.refresh();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
