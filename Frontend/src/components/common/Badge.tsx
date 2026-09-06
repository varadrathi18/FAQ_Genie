import React from 'react';
import { cn } from '../../lib/utils';
import { PersonaType } from '../../types';
import { User, Shield, Terminal } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[#EEECFF] text-[#493ee5] border-[#D9D6FE]',
    purple: 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20',
    success: 'bg-[#ECFDF5] text-[#16845B] border-[#A7F3D0]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    error: 'bg-[#FEF2F2] text-[#C53030] border-[#FCA5A5]',
    neutral: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border leading-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface PersonaBadgeProps {
  persona: PersonaType;
  subLabel?: string;
  className?: string;
  showIcon?: boolean;
}

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  persona,
  subLabel,
  className,
  showIcon = false,
}) => {
  if (persona === 'nora') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]',
          className
        )}
      >
        {showIcon ? <User className="w-3 h-3 text-[#1D4ED8]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />}
        <span>Nora · {subLabel || 'Beginner'}</span>
      </span>
    );
  }

  if (persona === 'sam') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
          className
        )}
      >
        {showIcon ? <Shield className="w-3 h-3 text-[#B45309]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />}
        <span>Sam · {subLabel || 'Trust'}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]',
        className
      )}
    >
      {showIcon ? <Terminal className="w-3 h-3 text-[#7E22CE]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />}
      <span>Pro · {subLabel || 'Technical'}</span>
    </span>
  );
};
