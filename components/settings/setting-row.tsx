import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: ReactNode;
  description?: ReactNode;
  /** Right-aligned content: a Switch, a value + chevron, or an input. */
  right?: ReactNode;
  /** When set, the whole row is a single tappable button. */
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

/**
 * A single setting row. With `onClick` the entire row is one tappable button
 * (so tapping the label toggles a switch / opens an editor); without it, it's a
 * static container — e.g. for an inline `<input>` on the right.
 */
export function SettingRow({
  label,
  description,
  right,
  onClick,
  disabled,
  destructive,
}: Props) {
  const inner = (
    <div className="flex w-full items-center gap-3 px-4 py-3 text-left">
      <div className="min-w-0 flex-1">
        <p className={cn('text-body-md', destructive ? 'text-error-text' : 'text-ink')}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-caption-sm text-muted">{description}</p>
        )}
      </div>
      {right != null && <div className="shrink-0">{right}</div>}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="block w-full transition-colors hover:bg-surface-soft disabled:opacity-50"
      >
        {inner}
      </button>
    );
  }
  return inner;
}
