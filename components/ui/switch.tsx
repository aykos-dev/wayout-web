'use client';

import { cn } from '@/lib/utils';

interface Props {
  checked: boolean;
  onCheckedChange?: (value: boolean) => void;
  disabled?: boolean;
  /** When false, renders a non-interactive visual (for use inside a tappable row). */
  interactive?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Accessible toggle switch. Primary-green when on, with a smooth thumb.
 * Set `interactive={false}` to render a presentational track inside a clickable
 * row (the row itself handles the tap), avoiding double-toggles.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  interactive = true,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const track = (
    <span
      aria-hidden={!interactive}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-out',
        checked ? 'bg-primary' : 'bg-surface-strong',
        disabled && 'opacity-40',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </span>
  );

  if (!interactive) return track;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed"
    >
      {track}
    </button>
  );
}
