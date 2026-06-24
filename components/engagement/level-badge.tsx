import { cn } from '@/lib/utils';

/** Accent gradient per level (1→5). */
const LEVEL_STYLE: Record<number, string> = {
  1: 'bg-slate-100 text-slate-700',
  2: 'bg-emerald-100 text-emerald-800',
  3: 'bg-sky-100 text-sky-800',
  4: 'bg-violet-100 text-violet-800',
  5: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
};

export function LevelBadge({
  level,
  name,
  className,
}: {
  level: number;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-badge font-semibold',
        LEVEL_STYLE[level] ?? LEVEL_STYLE[1],
        className,
      )}
    >
      <span className="opacity-70">Lv {level}</span>
      <span>{name}</span>
    </span>
  );
}
