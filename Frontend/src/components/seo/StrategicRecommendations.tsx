import React from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StrategicRecommendations: React.FC<{ recommendations?: { text: string; tag?: string; type: 'check' | 'tip' }[], className?: string }> = ({ recommendations = [], className }) => {
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
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} className={cn("flex items-start gap-3 p-3.5 rounded-lg border", 
              rec.type === 'check' ? "bg-[#F8F9FA] border-[#E5E7EB]" : "bg-[#EEECFF]/40 border-[#635BFF]/20"
            )}>
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                rec.type === 'check' ? "bg-[#ECFDF5] text-[#16845B]" : "bg-[#EEECFF] text-[#635BFF]"
              )}>
                {rec.type === 'check' ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Lightbulb className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-1 text-xs">
                {rec.tag && (
                  <span className={cn("font-mono text-[10px] uppercase font-semibold tracking-wider",
                    rec.type === 'check' ? "text-[#16845B]" : "text-[#635BFF]"
                  )}>
                    {rec.tag}
                  </span>
                )}
                <p className="text-[#111318] leading-relaxed">
                  {rec.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#69707D]">No recommendations generated.</p>
        )}
      </div>
    </div>
  );
};
