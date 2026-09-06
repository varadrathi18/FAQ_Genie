import React from 'react';
import { FAQ } from '../../types';
import { ChevronDown, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SERPSnippetPreviewProps {
  title: string;
  url: string;
  faqs: FAQ[];
  className?: string;
}

export const SERPSnippetPreview: React.FC<SERPSnippetPreviewProps> = ({
  title,
  url,
  faqs,
  className,
}) => {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-lg p-6 text-left select-none', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#111318]">Google Search SERP Preview</h3>
          <p className="text-xs text-[#69707D] mt-0.5">
            Rich Results visual simulation with Schema.org FAQPage snippet
          </p>
        </div>
        <span className="text-[11px] font-mono uppercase bg-[#EEECFF] text-[#493ee5] px-2 py-0.5 rounded font-semibold">
          RICH SNIPPET SIMULATION
        </span>
      </div>

      {/* Google Result Container */}
      <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] max-w-2xl font-sans">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#202124] mb-1">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500">
            <Globe className="w-2.5 h-2.5" />
          </div>
          <span className="truncate">{displayUrl}</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500">faqs</span>
        </div>

        {/* Title */}
        <h4 className="text-[#1a0dab] hover:underline text-base font-medium leading-tight mb-1 cursor-pointer">
          {title} | Frequently Asked Questions
        </h4>

        {/* Description */}
        <p className="text-xs text-[#4d5156] leading-relaxed mb-3">
          Explore frequently asked questions about setup complexity, enterprise security, multi-speaker audio diarization, and programmatic API integrations.
        </p>

        {/* Expandable FAQ items inside Google SERP */}
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          {faqs.slice(0, 3).map((faq) => (
            <div key={faq.id} className="py-1.5 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between text-xs font-medium text-[#202124] cursor-pointer">
                <span>{faq.question}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
