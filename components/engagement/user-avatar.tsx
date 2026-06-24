import { cn } from '@/lib/utils';

const SIZES = { md: 'size-12 text-title-sm', lg: 'size-20 text-2xl', xl: 'size-24 text-3xl' } as const;

export function UserAvatar({
  name,
  url,
  size = 'md',
  className,
}: {
  name: string | null;
  url: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? 'Traveler'}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }
  const initials = (name ?? 'Explorer')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-active',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
