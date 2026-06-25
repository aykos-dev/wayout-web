'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User, UserCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/engagement/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const auth = useAuth();
  const router = useRouter();

  // Until the session is read from localStorage, render a neutral placeholder
  // so logged-in users don't see a "Sign in" flash on load / language change.
  if (!auth.ready) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
      >
        <span className="size-7 animate-pulse rounded-full bg-surface-strong" />
      </span>
    );
  }

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
          <UserAvatar
            name={auth.user.fullName}
            url={auth.user.avatarUrl ?? null}
            size="sm"
          />
          <span className="hidden sm:inline">
            {auth.user.fullName ?? auth.user.phone}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href="/profile/me"
            onClick={() => track('nav_click', { target: '/profile/me', label: 'profile' })}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
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
