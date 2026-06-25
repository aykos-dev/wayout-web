'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LevelBadge } from './level-badge';

/** Flavor copy per level (the 5-level system is fixed in the backend). */
const LEVEL_DESC: Record<number, string> = {
  1: 'You’re just getting started. Book tours, write reviews and explore to earn XP and climb the ranks.',
  2: 'Finding your footing on the trails — keep exploring to level up.',
  3: 'A seasoned traveler with several trips under your belt.',
  4: 'Dedicated to the outdoors. Few explorers climb this high.',
  5: 'Outway royalty — you live for the mountains.',
};

interface Props {
  level: number;
  name: string;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
}

/** Click-to-reveal details for the user's level: XP band + what it means. */
export function LevelInfo({ level, name, xp, currentLevelXp, nextLevelXp }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`About level ${level}, ${name}`}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <LevelBadge level={level} name={name} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 p-4">
        <p className="text-title-sm text-ink">
          Level {level} · {name}
        </p>
        <p className="mt-1 text-caption-sm text-muted">
          {nextLevelXp != null
            ? `${currentLevelXp.toLocaleString()}–${nextLevelXp.toLocaleString()} XP`
            : `${currentLevelXp.toLocaleString()}+ XP`}
        </p>
        <p className="mt-3 text-body-sm text-body">{LEVEL_DESC[level] ?? ''}</p>
        {nextLevelXp != null && (
          <p className="mt-3 text-caption-sm text-muted">
            {(nextLevelXp - xp).toLocaleString()} XP to level up
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
