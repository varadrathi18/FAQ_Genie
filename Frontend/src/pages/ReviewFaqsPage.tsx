import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { PersonaTabs } from '../components/faq/PersonaTabs';
import { FAQCard } from '../components/faq/FAQCard';
import { EditFAQModal } from '../components/faq/EditFAQModal';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { useToast } from '../context/ToastContext';
import { FAQ } from '../types';
import { ArrowLeft, ArrowRight, CheckCheck, XCircle } from 'lucide-react';

export const ReviewFaqsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    faqs,
    selectedFaqIds,
    toggleFaqSelection,
    selectAllFaqs,
    deselectAllFaqs,
    autoBalanceFaqs,
    updateFaq,
    personaFilter,
    setPersonaFilter,
    stats,
  } = useGeneration();

  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Filter FAQs based on tab
  const displayedFaqs = faqs.filter((faq) => {
    if (personaFilter === 'all') return true;
    return faq.persona === personaFilter;
  });

  const handleSuggest = () => {
    autoBalanceFaqs();
    toast('Balanced FAQ set selected (2 Nora, 2 Sam, 2 Pro)', 'success');
  };

  const handleContinue = () => {
    if (selectedFaqIds.length === 0) {
      toast('Please select at least 1 FAQ to analyze SEO', 'error');
      return;
    }
    navigate('/app/generate/seo');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-left">
      {/* Step Progression Bar */}
      <StepIndicator currentStep={2} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Review &amp; Select FAQs
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Generated 12 questions across three personas. Select the strongest set for your published collection.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={selectedFaqIds.length === 0}
            className="shadow-xs text-xs sm:text-sm"
          >
            <span>Continue to SEO</span>
            <span className="font-mono text-xs opacity-80">({selectedFaqIds.length})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Persona Tabs & Suggest Best Button */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 sm:p-4 shadow-xs">
        <PersonaTabs
          activeTab={personaFilter}
          onTabChange={setPersonaFilter}
          counts={{
            total: stats.total,
            nora: stats.noraCount,
            sam: stats.samCount,
            pro: stats.proCount,
          }}
          onSuggestBest={handleSuggest}
        />
      </div>

      {/* Selection Control Summary Bar */}
      <div className="flex items-center justify-between text-xs text-[#69707D] px-1 select-none">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#111318]">
            {selectedFaqIds.length} of {faqs.length} FAQs selected
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="hidden sm:inline">
            ({stats.selectedNora} Nora, {stats.selectedSam} Sam, {stats.selectedPro} Pro)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectAllFaqs}
            className="hover:text-[#635BFF] flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={deselectAllFaqs}
            className="hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Deselect All</span>
          </button>
        </div>
      </div>

      {/* FAQ Cards Grid (2 cols desktop, 1 col mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayedFaqs.map((faq) => (
          <FAQCard
            key={faq.id}
            faq={faq}
            isSelected={selectedFaqIds.includes(faq.id)}
            onToggle={() => toggleFaqSelection(faq.id)}
            onEdit={() => setEditingFaq(faq)}
          />
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('/app/generate')}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Product Info</span>
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          disabled={selectedFaqIds.length === 0}
          className="shadow-xs"
        >
          <span>Continue to SEO Analysis</span>
          <span className="font-mono text-xs opacity-90">({selectedFaqIds.length} Selected)</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Edit FAQ Modal */}
      <EditFAQModal
        faq={editingFaq}
        isOpen={!!editingFaq}
        onClose={() => setEditingFaq(null)}
        onSave={updateFaq}
      />
    </div>
  );
};
