import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  'Parsing product documentation & endpoint URLs...',
  'Extracting user inquiries across customer intent funnels...',
  'Synthesizing Nora (Beginner) onboarding inquiries...',
  'Evaluating Sam (Trust & Risk) security concerns...',
  'Constructing Pro (Technical) schema & webhook answers...',
  'Finalizing composite SEO score & semantic deduplication...',
];

export const LoadingSynthesis: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        {/* Animated Icon */}
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#EEECFF] animate-ping opacity-40" />
          <div className="w-14 h-14 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-7 h-7 animate-spin duration-3000" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#111318] tracking-tight mb-2">
          Generating Persona-Aware FAQs
        </h3>
        <p className="text-xs text-[#69707D] mb-6">
          FAQGenie is synthesizing 12 targeted Q&amp;As balanced across Beginner, Trust, and Technical personas.
        </p>

        {/* Step checklist */}
        <div className="space-y-2.5 text-left bg-[#F8F9FA] p-4 rounded-xl border border-[#E5E7EB]">
          {steps.map((step, idx) => {
            const isFinished = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className="flex items-center gap-2.5 text-xs transition-opacity duration-200"
                style={{ opacity: idx > currentStepIndex ? 0.35 : 1 }}
              >
                {isFinished ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                )}
                <span
                  className={
                    isCurrent
                      ? 'font-semibold text-[#111318]'
                      : isFinished
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
