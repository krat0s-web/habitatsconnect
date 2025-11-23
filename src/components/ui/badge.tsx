import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 font-semibold text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-sage-600 text-white shadow hover:bg-sage-700',
        secondary: 'border-transparent bg-warm-gray-100 text-warm-gray-900 hover:bg-warm-gray-200',
        destructive: 'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        outline: 'text-warm-gray-950 border-warm-gray-300',
        success: 'border-transparent bg-green-100 text-green-700 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        purple: 'border-transparent bg-purple-100 text-purple-700 hover:bg-purple-200',
        blue: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200',
        pink: 'border-transparent bg-pink-100 text-pink-700 hover:bg-pink-200',
        terracotta:
          'border-transparent bg-terracotta-500 text-white shadow hover:bg-terracotta-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
