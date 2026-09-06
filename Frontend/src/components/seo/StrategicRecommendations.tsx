import React from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StrategicRecommendations: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-lg p-6 select-none', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#111318]">Strategic Recommendations</h3>
          <p className="text-xs text-[#69707D] mt-0.5">
            Key actionable insights derived from the combined question set
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Recommendation Item 1 */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
          <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#16845B] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#16845B] tracking-wider">
              PRIMARY KEYWORD TARGETING INTACT
            </span>
            <p className="text-[#111318] leading-relaxed">
              Questions directly match high-volume long-tail conversational searches regarding setup complexity, multi-channel diarization, and automated webhook exports.
            </p>
          </div>
        </div>

        {/* Recommendation Item 2 */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
          <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#16845B] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#16845B] tracking-wider">
              FUNNEL COVERAGE VERIFIED
            </span>
            <p className="text-[#111318] leading-relaxed">
              Maintains balanced distribution between top-of-funnel usability queries (Nora), mid-funnel security evaluation (Sam), and bottom-funnel technical validation (Pro).
            </p>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#EEECFF]/40 border border-[#635BFF]/20">
          <div className="w-5 h-5 rounded-full bg-[#EEECFF] text-[#635BFF] flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#635BFF] tracking-wider">
              SCHEMA ENHANCEMENT TIP
            </span>
            <p className="text-[#111318] leading-relaxed">
              Embedding the FAQPage JSON-LD snippet directly in your HTML header will help qualify these answers for expandable Google SERP rich result carousels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
