import { Droplet, Mountain, Waves, Triangle, Hexagon } from 'lucide-react';
import type { DestinationCategory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const ICONS: Record<DestinationCategory, typeof Droplet> = {
  waterfall: Droplet,
  peak: Mountain,
  lake: Waves,
  canyon: Triangle,
  cave: Hexagon,
};

export function CategoryBadge({
  category,
  label,
}: {
  category: DestinationCategory;
  label: string;
}) {
  const Icon = ICONS[category];
  return (
    <Badge variant="muted" className="gap-1 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
