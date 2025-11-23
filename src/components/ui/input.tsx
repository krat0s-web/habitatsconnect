import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex bg-transparent file:bg-transparent disabled:opacity-50 shadow-sm px-3 py-1 border border-warm-gray-300 file:border-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 w-full h-11 file:font-medium placeholder:text-warm-gray-400 text-sm file:text-sm transition-colors disabled:cursor-not-allowed',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
