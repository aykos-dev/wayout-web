import type { ReactNode } from 'react';

/** A titled group of setting rows in a rounded, divided container (iOS-style). */
export function SettingGroup({
  title,
  description,
  children,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="px-1 text-caption-sm font-semibold uppercase tracking-wide text-muted">
          {title}
        </h2>
      )}
      <div className="divide-y divide-hairline overflow-hidden rounded-md border border-hairline bg-canvas">
        {children}
      </div>
      {description && (
        <p className="px-1 text-caption-sm text-muted">{description}</p>
      )}
    </section>
  );
}
