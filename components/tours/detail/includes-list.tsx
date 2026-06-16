import { Check, X } from 'lucide-react';

interface Props {
  title: string;
  items: string[];
  variant: 'included' | 'excluded';
}

export function IncludesList({ title, items, variant }: Props) {
  if (items.length === 0) return null;
  const Icon = variant === 'included' ? Check : X;
  return (
    <div>
      <h3 className="text-display-sm text-ink">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-body-md text-body">
            <Icon
              className={
                'mt-0.5 h-5 w-5 shrink-0 ' +
                (variant === 'included' ? 'text-ink' : 'text-muted')
              }
              strokeWidth={2}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
