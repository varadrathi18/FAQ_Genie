import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variants = {
      primary:
        'bg-[#635BFF] hover:bg-[#5148E5] active:bg-[#4338CA] text-white shadow-sm focus:ring-[#EEECFF]',
      secondary:
        'bg-white hover:bg-[#F8F9FA] active:bg-[#F1F5F9] text-[#111318] border border-[#E5E7EB] hover:border-[#D1D5DB] shadow-xs focus:ring-[#E5E7EB]',
      outline:
        'bg-transparent hover:bg-[#F8F9FA] text-[#111318] border border-[#E5E7EB] hover:border-[#D1D5DB] focus:ring-[#EEECFF]',
      ghost:
        'bg-transparent hover:bg-[#F3F4F6] active:bg-[#E5E7EB] text-[#69707D] hover:text-[#111318] focus:ring-[#EEECFF]',
      destructive:
        'bg-white hover:bg-[#FEF2F2] text-[#C53030] border border-[#FCA5A5] focus:ring-red-200',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
