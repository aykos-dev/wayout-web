'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth, type AuthUser } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { usePreferences } from '@/lib/preferences';
import { track } from '@/lib/analytics';
import type { DestinationCategory } from '@/lib/types';

type Resolver = (u: AuthUser) => void;
type Stage = 'form' | 'preferences' | 'done';

const ONBOARDING_CATEGORIES: DestinationCategory[] = [
  'waterfall',
  'peak',
  'lake',
  'canyon',
  'cave',
];

export function AuthModalHost() {
  const auth = useAuth();
  const prefs = usePreferences();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolverRef = useRef<Resolver | null>(null);
  const rejecterRef = useRef<((e: Error) => void) | null>(null);
  const registeredUserRef = useRef<AuthUser | null>(null);

  // Onboarding preferences state
  const [selectedCategories, setSelectedCategories] = useState<DestinationCategory[]>([]);
  const [maxBudget, setMaxBudget] = useState('');

  // Register the opener exactly once. `auth._register` writes to a ref inside
  // the AuthProvider — it doesn't trigger a re-render, so re-registering would
  // create an infinite loop. The opener captures only `setOpen` (stable) and
  // the refs (stable), so it never goes stale.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    auth._register({
      open: () =>
        new Promise<AuthUser>((resolve, reject) => {
          resolverRef.current = resolve;
          rejecterRef.current = reject;
          setStage('form');
          setSelectedCategories([]);
          setMaxBudget('');
          setOpen(true);
        }),
    });
  }, []);

  const close = (cancelled = true) => {
    setOpen(false);
    setStage('form');
    if (cancelled && rejecterRef.current) {
      rejecterRef.current(new Error('cancelled'));
    }
    resolverRef.current = null;
    rejecterRef.current = null;
    registeredUserRef.current = null;
  };

  const finishOnboarding = () => {
    if (registeredUserRef.current) {
      resolverRef.current?.(registeredUserRef.current);
    }
    resolverRef.current = null;
    rejecterRef.current = null;
    registeredUserRef.current = null;
    setStage('done');
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { accessToken, user } = await userApi.quickRegister({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      auth.setSession(accessToken, user);
      registeredUserRef.current = user;
      track('sign_up', { method: 'quick_register' });
      track('login', { method: 'quick_register' });
      setStage('preferences');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed';
      track('auth_register_fail', { reason: message });
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const toggleCategory = (cat: DestinationCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const savePreferences = () => {
    if (selectedCategories.length > 0) {
      prefs.setCategories(selectedCategories);
    }
    const budget = Number(maxBudget);
    if (budget > 0) {
      prefs.setBudget(budget);
    }
    track('onboarding_preferences_save', {
      categories: selectedCategories,
      has_budget: budget > 0,
    });
    finishOnboarding();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close(stage === 'form')}>
      <DialogContent className="sm:max-w-md">
        {stage === 'form' && (
          <>
            <h2 className="text-display-sm text-ink">Quick sign-in</h2>
            <p className="mt-1 text-body-sm text-muted">
              We just need your name and phone — operators will call you to confirm.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field label="Full name" icon={<User className="h-4 w-4" />}>
                <input
                  type="text"
                  autoFocus
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 w-full rounded-sm border border-hairline px-3 text-body-md outline-none focus:border-ink"
                />
              </Field>
              <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="h-12 w-full rounded-sm border border-hairline px-3 text-body-md outline-none focus:border-ink"
                />
              </Field>
              {error && (
                <p className="text-body-sm text-error-text">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Signing in...' : 'Continue'}
              </Button>
            </form>
          </>
        )}

        {stage === 'preferences' && (
          <>
            <h2 className="text-display-sm text-ink">
              What kind of tours do you enjoy?
            </h2>
            <p className="mt-1 text-body-sm text-muted">
              Help us personalize your experience.
            </p>

            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_CATEGORIES.map((cat) => {
                  const isActive = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={
                        'rounded-full border px-3 py-1.5 text-body-sm capitalize transition-colors ' +
                        (isActive
                          ? 'border-ink bg-ink text-white'
                          : 'border-hairline text-ink hover:border-ink')
                      }
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <label className="block space-y-1.5">
                <span className="text-caption text-ink">
                  Max budget per trip (UZS)
                </span>
                <input
                  type="number"
                  min={0}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="e.g. 500000"
                  className="h-12 w-full rounded-sm border border-hairline px-3 text-body-md outline-none focus:border-ink"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button onClick={savePreferences} className="w-full">
                Save &amp; continue
              </Button>
              <button
                type="button"
                onClick={finishOnboarding}
                className="text-body-sm text-muted hover:text-ink transition-colors"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-caption text-ink">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
