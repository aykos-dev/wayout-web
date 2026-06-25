'use client';

import type { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BadgeIcon } from './badge-icon';

const TIER_LABEL: Record<number, string> = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };

interface Props {
  id: string;
  name: string;
  description: string;
  tier: number;
  earned?: boolean;
  earnedAt?: string | null;
  progress?: number;
  target?: number;
  children: ReactNode;
}

/**
 * Click-to-reveal details for a badge: what it means, how to earn it, and the
 * user's progress. Wrap the badge tile with this — tapping it opens the popover.
 */
export function BadgeInfo({
  id,
  name,
  description,
  tier,
  earned = true,
  earnedAt,
  progress,
  target,
  children,
}: Props) {
  const locked = earned === false;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`About the ${name} badge`}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 p-4">
        <div className="flex items-center gap-3">
          <BadgeIcon badgeId={id} tier={tier} earned={!locked} size="md" />
          <div className="min-w-0">
            <p className="text-title-sm text-ink">{name}</p>
            <p className="text-caption-sm text-muted">
              {TIER_LABEL[tier] ?? `Tier ${tier}`}
              {locked ? ' · Locked' : ''}
            </p>
          </div>
        </div>

        <p className="mt-3 text-body-sm text-body">{description}</p>

        {locked && progress != null && target != null && (
          <div className="mt-3">
            <div className="flex justify-between text-caption-sm text-muted">
              <span>Progress</span>
              <span className="tabular-nums">
                {progress}/{target}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.round((progress / target) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {!locked && earnedAt && (
          <p className="mt-3 text-caption-sm text-muted">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
