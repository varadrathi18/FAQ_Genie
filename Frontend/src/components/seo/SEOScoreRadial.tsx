import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface SEOScoreRadialProps {
  score: number;
  questionCount: number;
  readTime?: string;
  className?: string;
}

export const SEOScoreRadial: React.FC<SEOScoreRadialProps> = ({
  score = 92,
  questionCount = 6,
  readTime = '~3 min',
  className,
}) => {
  // SVG circular gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-lg p-6 text-center select-none', className)}>
      <div className="flex items-center justify-between text-xs font-mono uppercase text-[#69707D] tracking-wider mb-6">
        <span>COMPOSITE INDEX</span>
        <span className="text-[#16845B] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
          CALCULATED
        </span>
      </div>

      {/* Circular Ring Gauge */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#EEECFF"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#635BFF"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-[#111318]">{score}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#69707D]">
            SCORE / 100
          </span>
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-[#16845B] mt-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+18.4%</span>
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#16845B] text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Excellent FAQ Set</span>
      </div>

      {/* Description text */}
      <p className="text-xs text-[#464555] leading-relaxed mt-3.5 max-w-xs mx-auto">
        Strong topical breadth, natural search phrasing, and zero keyword cannibalization across all target search vectors.
      </p>

      {/* Bottom Mini Metrics */}
      <div className="mt-6 pt-5 border-t border-[#F1F5F9] grid grid-cols-2 gap-4 text-center">
        <div>
          <span className="block text-base font-bold text-[#111318]">{questionCount}</span>
          <span className="text-[11px] font-mono text-[#69707D] uppercase tracking-wider">
            QUESTIONS
          </span>
        </div>
        <div className="border-l border-[#F1F5F9]">
          <span className="block text-base font-bold text-[#111318]">{readTime}</span>
          <span className="text-[11px] font-mono text-[#69707D] uppercase tracking-wider">
            READ TIME
          </span>
        </div>
      </div>
    </div>
  );
};
