'use client';

import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

type Props = React.ComponentPropsWithoutRef<typeof RadixSlider.Root> & {
  'aria-label'?: string;
};

/** Styled single-thumb slider built on @radix-ui/react-slider. */
export function Slider({ className, 'aria-label': ariaLabel, ...props }: Props) {
  return (
    <RadixSlider.Root
      className={cn(
        'relative flex w-full touch-none select-none items-center py-2',
        className,
      )}
      {...props}
    >
      <RadixSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-strong">
        <RadixSlider.Range className="absolute h-full rounded-full bg-primary" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label={ariaLabel}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
    </RadixSlider.Root>
  );
}
