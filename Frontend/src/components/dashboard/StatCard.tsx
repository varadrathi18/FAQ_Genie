import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  subtext,
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between select-none">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#69707D] mb-2">
        <span>{label}</span>
        {Icon && <Icon className="w-4 h-4 text-[#69707D]" />}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#111318]">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-[#16845B]',
              trend === 'down' && 'text-red-600',
              trend === 'neutral' && 'text-[#69707D]'
            )}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-[#69707D] mt-2">{subtext}</p>}
    </div>
  );
};
