import React from 'react';
import { SEOMetrics } from '../../types';
import { cn } from '../../lib/utils';

interface SEOMetricsListProps {
  metrics: SEOMetrics;
  className?: string;
}

export const SEOMetricsList: React.FC<SEOMetricsListProps> = ({ metrics, className }) => {
  const dimensions = [
    {
      name: 'Question Quality',
      value: metrics.questionQuality,
      note: 'High search query clarity',
      isPercentage: true,
      barColor: 'bg-[#635BFF]',
    },
    {
      name: 'Topic Coverage',
      value: metrics.topicCoverage,
      note: 'Comprehensive product scope',
      isPercentage: true,
      barColor: 'bg-[#635BFF]',
    },
    {
      name: 'Intent Diversity',
      value: metrics.intentDiversity,
      note: 'Balanced informational & transactional',
      isPercentage: true,
      barColor: 'bg-[#635BFF]',
    },
    {
      name: 'Persona Coverage',
      value: metrics.personaCoverage,
      note: 'Even distribution across Nora, Sam, Pro',
      isPercentage: true,
      barColor: 'bg-[#635BFF]',
    },
    {
      name: 'Duplicate Risk',
      value: metrics.duplicateRisk,
      note: 'Minimal semantic cannibalization',
      isPercentage: false,
      displayValue: `${metrics.duplicateRisk}%`,
      barColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-lg p-6 select-none', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#111318]">Evaluation Dimensions</h3>
          <p className="text-xs text-[#69707D] mt-0.5">
            Algorithmic scoring across lexical and user intent vectors
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#16845B] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded">
          5 CHECKS PASSED
        </span>
      </div>

      <div className="space-y-4">
        {dimensions.map((dim) => {
          const widthPercent = dim.isPercentage ? `${dim.value}%` : `${Math.min(dim.value * 20, 100)}%`;

          return (
            <div key={dim.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111318]">{dim.name}</span>
                <span className="font-mono font-semibold text-[#111318] tabular-nums">
                  {dim.displayValue || `${dim.value}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700 ease-out', dim.barColor)}
                  style={{ width: widthPercent }}
                />
              </div>

              <p className="text-[11px] text-[#69707D]">{dim.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
