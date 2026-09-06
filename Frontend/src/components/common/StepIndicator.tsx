import React from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export interface StepItem {
  number: string;
  label: string;
  path: string;
}

interface StepIndicatorProps {
  currentStep: number; // 1 to 4
  className?: string;
  isClickable?: boolean;
}

export const steps: StepItem[] = [
  { number: '01', label: 'PRODUCT INFO', path: '/app/generate' },
  { number: '02', label: 'REVIEW FAQS', path: '/app/generate/review' },
  { number: '03', label: 'SEO ANALYSIS', path: '/app/generate/seo' },
  { number: '04', label: 'PREVIEW & EXPORT', path: '/app/generate/preview' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  className,
  isClickable = true,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center gap-3 text-xs tracking-wider font-semibold">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isPassed = stepNum < currentStep;

          const content = (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 transition-colors',
                isActive
                  ? 'bg-[#3E32D3] text-white px-2.5 py-1 rounded shadow-xs'
                  : isPassed
                  ? 'text-[#111318] hover:text-[#635BFF]'
                  : 'text-[#9CA3AF]'
              )}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              <span>{step.number}</span>
              <span>{step.label}</span>
            </span>
          );

          return (
            <React.Fragment key={step.number}>
              {index > 0 && <span className="text-[#C7C4D8]">/</span>}
              {isClickable && (isPassed || isActive) ? (
                <Link to={step.path} className="focus:outline-none">
                  {content}
                </Link>
              ) : (
                content
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#69707D]">
          <span className="font-semibold text-[#635BFF]">WORKFLOW PROGRESSION</span>
          <span>Step 0{currentStep} / 04</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isPassed = stepNum < currentStep;

            return (
              <div
                key={step.number}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  isActive
                    ? 'bg-[#635BFF]'
                    : isPassed
                    ? 'bg-[#3E32D3]'
                    : 'bg-[#E5E7EB]'
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-[#111318]">
            {steps[currentStep - 1]?.number} {steps[currentStep - 1]?.label}
          </span>
          <span className="text-[11px] text-[#69707D]">
            {currentStep === 1
              ? 'Tell us what you are launching'
              : currentStep === 2
              ? 'Select & balance high-impact FAQs'
              : currentStep === 3
              ? 'Set-level schema readiness'
              : 'Live widget & export ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
