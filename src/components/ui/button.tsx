import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex justify-center items-center gap-2 disabled:opacity-50 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2 font-semibold text-sm uppercase tracking-wide whitespace-nowrap transition-all duration-200 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-terracotta-500 text-white shadow-md hover:bg-terracotta-600 hover:shadow-lg',
        destructive: 'bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg',
        outline:
          'border-2 border-sage-600 bg-transparent text-sage-700 hover:bg-sage-50 hover:border-sage-700',
        secondary: 'bg-sage-600 text-white shadow-md hover:bg-sage-700 hover:shadow-lg',
        ghost: 'hover:bg-sand-100 hover:text-sage-700',
        link: 'text-terracotta-600 underline-offset-4 hover:underline hover:text-terracotta-700',
        gradient: 'bg-gradient-terracotta text-white shadow-md hover:shadow-xl hover:scale-[1.02]',
        warm: 'bg-gradient-warm text-white shadow-md hover:shadow-xl hover:scale-[1.02]',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-14 px-10 py-4 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
