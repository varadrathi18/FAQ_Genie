import React, { useState } from 'react';
import { FAQ, PersonaType } from '../../types';
import { ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { PersonaBadge } from '../common/PersonaBadge';
import { cn } from '../../lib/utils';

interface LiveWidgetPreviewProps {
  title: string;
  faqs: FAQ[];
  className?: string;
}

export const LiveWidgetPreview: React.FC<LiveWidgetPreviewProps> = ({
  title,
  faqs,
  className,
}) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [activePersonaFilter, setActivePersonaFilter] = useState<'all' | PersonaType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesPersona = activePersonaFilter === 'all' || faq.persona === activePersonaFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPersona && matchesSearch;
  });

  const toggleOpen = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn('bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs select-none', className)}>
      {/* Widget Header Mockup */}
      <div className="p-6 bg-gradient-to-b from-[#F9F9FF] to-white border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#635BFF] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#635BFF]">
            LIVE EMBEDDED WIDGET
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#111318] tracking-tight">{title}</h3>
        <p className="text-xs text-[#69707D] mt-1">
          Instant verified answers for onboarding, security compliance, and engineering inquiries.
        </p>

        {/* Search bar inside widget */}
        <div className="relative mt-4">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search answers by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111318] placeholder-[#9CA3AF] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]"
          />
        </div>

        {/* Persona quick filters */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActivePersonaFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              activePersonaFilter === 'all'
                ? 'bg-[#111318] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#69707D] hover:text-[#111318]'
            )}
          >
            All Questions ({faqs.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePersonaFilter('nora')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              activePersonaFilter === 'nora'
                ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                : 'bg-white border border-[#E5E7EB] text-[#69707D]'
            )}
          >
            Beginner
          </button>
          <button
            type="button"
            onClick={() => setActivePersonaFilter('sam')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              activePersonaFilter === 'sam'
                ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                : 'bg-white border border-[#E5E7EB] text-[#69707D]'
            )}
          >
            Trust & Security
          </button>
          <button
            type="button"
            onClick={() => setActivePersonaFilter('pro')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              activePersonaFilter === 'pro'
                ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]'
                : 'bg-white border border-[#E5E7EB] text-[#69707D]'
            )}
          >
            Developer
          </button>
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="divide-y divide-[#F1F5F9] max-h-[480px] overflow-y-auto">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#69707D]">
            No answers match the selected filter.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id} className="transition-colors hover:bg-[#F8F9FA]/60">
                <button
                  type="button"
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full p-4.5 text-left flex items-start justify-between gap-3 focus:outline-none"
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <PersonaBadge persona={faq.persona} />
                    </div>
                    <span className="text-sm font-semibold text-[#111318] block leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className="p-1 rounded-full text-[#69707D] shrink-0 mt-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4.5 pb-4 pt-0 text-sm text-[#464555] leading-relaxed animate-in fade-in-50 duration-150 border-t border-dashed border-[#F1F5F9]">
                    <div className="pt-2">
                      {faq.answer}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#9CA3AF]">
                      <span>VERIFIED ANSWER • {faq.codeId}</span>
                      <span className="text-emerald-600 font-sans font-medium flex items-center gap-1">
                        ✓ Syncs in Real-Time
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-3 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#69707D]">
        <span>Powered by FAQGenie AI Orchestration</span>
        <span className="font-mono">v3.2.0</span>
      </div>
    </div>
  );
};
