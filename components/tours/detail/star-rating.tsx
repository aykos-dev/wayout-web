'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange?: (next: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
      aria-label={`rating ${value} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= display;
        return (
          <button
            type="button"
            key={i}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(i)}
            onClick={() => !readOnly && onChange?.(i)}
            aria-label={`${i} of 5`}
            className={cn(
              'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
              readOnly ? 'cursor-default' : 'cursor-pointer',
            )}
          >
            <Star
              className={cn(
                SIZE[size],
                'transition-colors',
                filled
                  ? 'fill-primary text-primary'
                  : 'text-hairline-soft',
              )}
              strokeWidth={1.6}
            />
          </button>
        );
      })}
    </div>
  );
}
