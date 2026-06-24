'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';

/**
 * Shares a traveler profile. Uses the native share sheet when available,
 * otherwise opens Telegram's share dialog (the profile route ships an OG card).
 */
export function BadgeShareButton({
  userId,
  label = 'Share',
}: {
  userId: string;
  label?: string;
}) {
  const share = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/profile/${userId}`
        : `/profile/${userId}`;
    const text = 'Check out my adventures on Outway 🏔️';
    track('profile_share', { user_id: userId });
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Outway', text, url });
        return;
      } catch {
        /* fall through to Telegram */
      }
    }
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tg, '_blank');
  };

  return (
    <Button variant="secondary" size="sm" onClick={share}>
      <Share2 className="mr-1.5 size-4" />
      {label}
    </Button>
  );
}
