import Image from 'next/image';
import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  src: string | null;
  alt: string;
  aspect?: 'square' | 'portrait' | 'video' | 'landscape';
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const ASPECT: Record<NonNullable<Props['aspect']>, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  video: 'aspect-video',
  landscape: 'aspect-[4/3]',
};

export function TourCardImage({
  src,
  alt,
  aspect = 'square',
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw',
}: Props) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-md bg-surface-soft',
        ASPECT[aspect],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-strong to-surface-soft text-muted-soft">
          <Mountain className="h-12 w-12" strokeWidth={1.2} />
        </div>
      )}
    </div>
  );
}
