import { Badge } from '@/components/ui/badge';

interface Props {
  categories: string[];
  max?: number;
}

export function CategoryChipRow({ categories, max }: Props) {
  if (!categories || categories.length === 0) return null;
  const shown = typeof max === 'number' ? categories.slice(0, max) : categories;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((c) => (
        <Badge key={c} variant="floating" className="text-caption">
          {c}
        </Badge>
      ))}
    </div>
  );
}
