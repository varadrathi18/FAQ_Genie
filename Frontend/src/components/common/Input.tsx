import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  badge?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, badge, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {(label || badge) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-[#111318]">
                {label}
              </label>
            )}
            {badge && (
              <span className="text-[11px] font-semibold text-[#69707D] tracking-wider uppercase">
                {badge}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#69707D] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-10 px-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111318] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#EEECFF] disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]',
              icon && 'pl-9',
              error && 'border-[#C53030] focus:border-[#C53030] focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#C53030]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#69707D]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  badge?: string;
  error?: string;
  helperText?: string;
  charCount?: number;
  maxChars?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, badge, error, helperText, charCount, maxChars, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {(label || badge) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label htmlFor={textareaId} className="text-sm font-medium text-[#111318]">
                {label}
              </label>
            )}
            {badge && (
              <span className="text-[11px] font-semibold text-[#69707D] tracking-wider uppercase">
                {badge}
              </span>
            )}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full p-3.5 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111318] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#EEECFF] disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF] resize-y min-h-[120px] leading-relaxed',
            error && 'border-[#C53030] focus:border-[#C53030] focus:ring-red-100',
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-1 text-xs">
          {error ? (
            <p className="text-[#C53030]">{error}</p>
          ) : helperText ? (
            <p className="text-[#69707D]">{helperText}</p>
          ) : (
            <div />
          )}
          {typeof charCount === 'number' && (
            <span className="text-[#69707D] font-mono tabular-nums">
              {charCount} {maxChars ? `/ ${maxChars} chars` : 'chars'}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
