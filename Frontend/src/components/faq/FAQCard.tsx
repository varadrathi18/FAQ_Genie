import React from 'react';
import { FAQ } from '../../types';
import { PersonaBadge } from '../common/PersonaBadge';
import { Badge } from '../common/Badge';
import { CopyButton } from '../common/CopyButton';
import { Edit2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FAQCardProps {
  faq: FAQ;
  isSelected: boolean;
  onToggle: () => void;
  onEdit?: () => void;
}

export const FAQCard: React.FC<FAQCardProps> = ({
  faq,
  isSelected,
  onToggle,
  onEdit,
}) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'group relative bg-white border rounded-lg p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none',
        isSelected
          ? 'border-[#635BFF] shadow-xs'
          : 'border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-xs'
      )}
    >
      {/* Top Header Row: Persona Badge + Optional Recommended Badge + Checkbox */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PersonaBadge persona={faq.persona} />
            {faq.recommended && (
              <Badge variant="success" size="sm">
                Recommended
              </Badge>
            )}
          </div>

          {/* Styled Checkbox */}
          <div
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0',
              isSelected
                ? 'bg-[#635BFF] text-white'
                : 'border border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* Question Title */}
        <h4 className="text-[15px] font-semibold text-[#111318] leading-snug mb-2.5">
          {faq.question}
        </h4>

        {/* Answer Content */}
        <p className="text-sm text-[#464555] leading-relaxed mb-4">
          {faq.answer}
        </p>
      </div>

      {/* Footer: ID code and Action Buttons */}
      <div
        className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#69707D]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-[11px] tracking-wider text-[#69707D]">
          ID: {faq.codeId}
        </span>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-xs text-[#69707D] hover:text-[#111318] px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}

          <CopyButton
            textToCopy={`${faq.question}\n\n${faq.answer}`}
            label="Copy"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
};
