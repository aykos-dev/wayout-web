import { Footprints } from 'lucide-react';
import type { TourDifficulty } from '@/lib/types';
import { cn } from '@/lib/utils';

const SCALE: Record<TourDifficulty, number> = {
  easy: 1,
  moderate: 2,
  hard: 4,
  extreme: 5,
};

interface Props {
  difficulty: TourDifficulty | null | undefined;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function DifficultyScale({
  difficulty,
  label,
  showLabel = true,
  size = 'md',
  className,
}: Props) {
  if (!difficulty) return null;
  const level = SCALE[difficulty];
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5" aria-label={`difficulty ${level} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Footprints
            key={i}
            className={cn(
              dim,
              i <= level ? 'text-ink' : 'text-hairline-soft',
            )}
            strokeWidth={2}
          />
        ))}
      </div>
      {showLabel && label && (
        <span className="text-body-sm text-muted">{label}</span>
      )}
    </div>
  );
}
