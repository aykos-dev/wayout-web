'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api-client';
import { SUPPORTED, type Lang } from '@/lib/i18n';
import { LANG_LABELS, setLanguage } from '@/lib/set-language';
import { UserAvatar } from '@/components/engagement/user-avatar';
import { SettingGroup } from '@/components/settings/setting-group';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { track } from '@/lib/analytics';

function FieldRow({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-24 shrink-0 text-body-md text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-right text-body-md text-ink outline-none placeholder:text-muted-soft"
      />
    </div>
  );
}

export function AccountSection({ lang }: { lang: Lang }) {
  const auth = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(auth.user?.fullName ?? '');
  const [phone, setPhone] = useState(auth.user?.phone ?? '');
  const [email, setEmail] = useState(auth.user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.user) {
      setFullName(auth.user.fullName ?? '');
      setPhone(auth.user.phone ?? '');
      setEmail(auth.user.email ?? '');
    }
  }, [auth.user]);

  const dirty =
    !!auth.user &&
    (fullName !== (auth.user.fullName ?? '') ||
      phone !== (auth.user.phone ?? '') ||
      email !== (auth.user.email ?? ''));

  async function save() {
    setSaving(true);
    setError('');
    setSavedOk(false);
    try {
      const updated = await userApi.updateProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      auth.setSession(auth.token!, updated);
      track('settings_save', {});
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const [url] = await userApi.uploadPhotos([file]);
      if (!url) throw new Error('Upload failed');
      const updated = await userApi.updateProfile({ avatarUrl: url });
      auth.setSession(auth.token!, updated);
      track('settings_avatar_update', {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex justify-center py-2">
        <div className="relative">
          <UserAvatar
            name={auth.user?.fullName ?? null}
            url={auth.user?.avatarUrl ?? null}
            size="xl"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change photo"
            className="absolute bottom-0 right-0 inline-flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-canvas transition hover:bg-primary-active"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />
        </div>
      </div>

      <SettingGroup title="Account">
        <FieldRow label="Name" value={fullName} onChange={setFullName} placeholder="Your name" />
        <FieldRow label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+998…" />
        <FieldRow label="Email" type="email" value={email} onChange={setEmail} placeholder="optional" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-soft"
            >
              <span className="flex-1 text-body-md text-ink">Language</span>
              <span className="text-body-sm text-muted">{LANG_LABELS[lang]}</span>
              <ChevronRight className="size-4 text-muted-soft" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SUPPORTED.map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLanguage(l, lang)}
                className={l === lang ? 'font-semibold' : ''}
              >
                {LANG_LABELS[l]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SettingGroup>

      <div className="flex items-center gap-3 px-1">
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {savedOk && (
          <span className="inline-flex items-center gap-1 text-body-sm text-primary-active">
            <Check className="size-4" /> Saved
          </span>
        )}
        {error && <span className="text-body-sm text-error-text">{error}</span>}
      </div>
    </div>
  );
}
