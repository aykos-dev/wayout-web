/**
 * Switchable browse-card layout (see epics/ mobile UI plan).
 *
 * - `grid`   — 2-column compact grid on mobile (4:3 images). Default.
 * - `rows`   — horizontal list rows (image left, details right).
 * - `single` — one column, 16:9 landscape image.
 *
 * The default is set via the build-time env var `NEXT_PUBLIC_CARD_LAYOUT`.
 * A `?cardLayout=` URL query param overrides it at runtime (for QA preview
 * without a rebuild) — resolved client-side via `useCardLayout`.
 */
export type CardLayout = 'grid' | 'rows' | 'single';

export const CARD_LAYOUTS: readonly CardLayout[] = ['grid', 'rows', 'single'];

export function parseCardLayout(value: string | null | undefined): CardLayout | null {
  return value && (CARD_LAYOUTS as readonly string[]).includes(value)
    ? (value as CardLayout)
    : null;
}

/** Build-time default from env, falling back to `grid`. */
export const CARD_LAYOUT: CardLayout =
  parseCardLayout(process.env.NEXT_PUBLIC_CARD_LAYOUT) ?? 'grid';

/** Resolves the active layout from an optional URL search string. */
export function resolveCardLayout(search?: string): CardLayout {
  if (search) {
    const fromQuery = parseCardLayout(new URLSearchParams(search).get('cardLayout'));
    if (fromQuery) return fromQuery;
  }
  return CARD_LAYOUT;
}

/** Desktop (sm+) column ramp; mobile behavior is set per-layout below. */
const DESKTOP_COLS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

/**
 * Tailwind classes for a card container given the active layout and the
 * desktop column cap. Mobile: `grid` → 2 cols, `single` → 1 col, `rows` →
 * stacked flex rows. All converge to the multi-column grid at `sm`+.
 */
export function cardGridClass(layout: CardLayout, cols: 2 | 3 | 4 = 4): string {
  const desktop = DESKTOP_COLS[cols];
  if (layout === 'rows') return `flex flex-col gap-4 sm:grid sm:gap-5 ${desktop}`;
  if (layout === 'single') return `grid grid-cols-1 gap-x-6 gap-y-8 ${desktop}`;
  return `grid grid-cols-2 gap-3 ${desktop}`;
}
