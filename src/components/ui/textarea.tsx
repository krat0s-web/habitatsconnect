import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex bg-transparent disabled:opacity-50 shadow-sm px-3 py-2 border border-warm-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 w-full min-h-[80px] placeholder:text-warm-gray-400 text-sm disabled:cursor-not-allowed',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
