import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles, Loader2 } from 'lucide-react';

interface PersonaTabsProps {
  activeTab: 'all' | 'nora' | 'sam' | 'pro';
  onTabChange: (tab: 'all' | 'nora' | 'sam' | 'pro') => void;
  counts: {
    total: number;
    nora: number;
    sam: number;
    pro: number;
  };
  onSuggestBest?: () => void;
  showSuggestButton?: boolean;
  isSuggesting?: boolean;
}

export const PersonaTabs: React.FC<PersonaTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  onSuggestBest,
  showSuggestButton = true,
  isSuggesting = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
      {/* Tab Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
            activeTab === 'all'
              ? 'bg-[#111318] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#69707D] hover:text-[#111318] hover:bg-gray-50'
          )}
        >
          <span>All</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded text-[10px] font-mono',
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#69707D]'
            )}
          >
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('nora')}
          className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
            activeTab === 'nora'
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#69707D] hover:text-[#111318] hover:bg-gray-50'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
          <span>Nora (Beginner)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-700">
            {counts.nora}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('sam')}
          className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
            activeTab === 'sam'
              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#69707D] hover:text-[#111318] hover:bg-gray-50'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
          <span>Sam (Trust)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-50 text-amber-700">
            {counts.sam}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('pro')}
          className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
            activeTab === 'pro'
              ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#69707D] hover:text-[#111318] hover:bg-gray-50'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
          <span>Pro (Technical)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-50 text-purple-700">
            {counts.pro}
          </span>
        </button>
      </div>

      {showSuggestButton && onSuggestBest && (
        <button
          type="button"
          onClick={onSuggestBest}
          disabled={isSuggesting}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors border self-start sm:self-auto",
            isSuggesting
              ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
              : "text-[#635BFF] hover:text-[#5148E5] bg-[#EEECFF]/60 hover:bg-[#EEECFF] border-[#635BFF]/20 cursor-pointer"
          )}
        >
          {isSuggesting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isSuggesting ? 'Suggesting...' : 'Suggest Best FAQs'}</span>
        </button>
      )}
    </div>
  );
};
