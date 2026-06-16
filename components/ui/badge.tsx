import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-badge transition-colors',
  {
    variants: {
      variant: {
        floating: 'bg-white text-ink shadow-airbnb',
        outline: 'border border-hairline text-ink',
        primary: 'bg-primary text-white',
        muted: 'bg-surface-strong text-ink',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
