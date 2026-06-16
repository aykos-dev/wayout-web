import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-button-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-active rounded-sm h-12 px-6 font-medium',
        secondary:
          'bg-white text-ink border border-ink rounded-sm h-12 px-6 font-medium hover:bg-surface-soft',
        pill:
          'bg-primary text-white hover:bg-primary-active rounded-full h-10 px-5 text-body-sm font-medium',
        ghost:
          'bg-transparent text-ink hover:bg-surface-soft rounded-sm h-10 px-4',
        link: 'bg-transparent text-ink underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        md: '',
        sm: 'h-9 px-4 text-body-sm',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
