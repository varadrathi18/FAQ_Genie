import React, { createContext, useContext, useState, useMemo } from 'react';
import { FAQ, GenerationProductInfo, SEOMetrics } from '../types';
import { mockFaqs, defaultSelectedFaqIds, mockSEOMetrics } from '../data/mockFaqs';

interface GenerationContextType {
  productInfo: GenerationProductInfo;
  setProductInfo: React.Dispatch<React.SetStateAction<GenerationProductInfo>>;
  updateProductInfoField: (field: keyof GenerationProductInfo, value: any) => void;
  faqs: FAQ[];
  selectedFaqIds: string[];
  toggleFaqSelection: (id: string) => void;
  selectAllFaqs: () => void;
  deselectAllFaqs: () => void;
  autoBalanceFaqs: () => void;
  updateFaq: (id: string, updated: Partial<FAQ>) => void;
  personaFilter: 'all' | 'nora' | 'sam' | 'pro';
  setPersonaFilter: (filter: 'all' | 'nora' | 'sam' | 'pro') => void;
  isGenerating: boolean;
  startGenerating: (onComplete?: () => void) => void;
  seoMetrics: SEOMetrics;
  stats: {
    total: number;
    selectedCount: number;
    noraCount: number;
    samCount: number;
    proCount: number;
    selectedNora: number;
    selectedSam: number;
    selectedPro: number;
  };
  resetWorkflow: () => void;
}

const initialProductInfo: GenerationProductInfo = {
  title: 'AI Meeting Summaries & Action Items',
  description:
    'Our new AI Meeting Summaries instantly transcribes multi-speaker conversations, extracts key decisions, assigns action items with deadlines to Linear or Jira, and syncs recording timestamps directly to Notion.',
  url: 'https://acmelabs.io/features/meeting',
  category: 'new_feature',
  specFile: {
    name: 'meeting-summary-v2-spec.pdf',
    size: '1.2 MB',
  },
};

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productInfo, setProductInfo] = useState<GenerationProductInfo>(initialProductInfo);
  const [faqs, setFaqs] = useState<FAQ[]>(mockFaqs);
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>(defaultSelectedFaqIds);
  const [personaFilter, setPersonaFilter] = useState<'all' | 'nora' | 'sam' | 'pro'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const updateProductInfoField = (field: keyof GenerationProductInfo, value: any) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFaqSelection = (id: string) => {
    setSelectedFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFaqs = () => {
    setSelectedFaqIds(faqs.map((f) => f.id));
  };

  const deselectAllFaqs = () => {
    setSelectedFaqIds([]);
  };

  const autoBalanceFaqs = () => {
    // Automatically select the best balanced 6 or 8 FAQs (Nora: 2-3, Sam: 2-3, Pro: 2-3)
    const recommendedOrTop = faqs
      .filter((f) => f.recommended || f.codeId.endsWith('-01') || f.codeId.endsWith('-02'))
      .slice(0, 6)
      .map((f) => f.id);
    setSelectedFaqIds(recommendedOrTop);
  };

  const updateFaq = (id: string, updated: Partial<FAQ>) => {
    setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, ...updated } : faq)));
  };

  const startGenerating = (onComplete?: () => void) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (onComplete) onComplete();
    }, 1400);
  };

  const resetWorkflow = () => {
    setProductInfo(initialProductInfo);
    setSelectedFaqIds(defaultSelectedFaqIds);
    setPersonaFilter('all');
  };

  const stats = useMemo(() => {
    const nora = faqs.filter((f) => f.persona === 'nora');
    const sam = faqs.filter((f) => f.persona === 'sam');
    const pro = faqs.filter((f) => f.persona === 'pro');

    const selectedFaqs = faqs.filter((f) => selectedFaqIds.includes(f.id));
    const selectedNora = selectedFaqs.filter((f) => f.persona === 'nora').length;
    const selectedSam = selectedFaqs.filter((f) => f.persona === 'sam').length;
    const selectedPro = selectedFaqs.filter((f) => f.persona === 'pro').length;

    return {
      total: faqs.length,
      selectedCount: selectedFaqIds.length,
      noraCount: nora.length,
      samCount: sam.length,
      proCount: pro.length,
      selectedNora,
      selectedSam,
      selectedPro,
    };
  }, [faqs, selectedFaqIds]);

  // Adjust SEO score dynamically based on selection balance
  const seoMetrics = useMemo(() => {
    const totalSelected = selectedFaqIds.length;
    if (totalSelected === 0) {
      return {
        ...mockSEOMetrics,
        compositeScore: 0,
        questionQuality: 0,
        topicCoverage: 0,
        intentDiversity: 0,
        personaCoverage: 0,
        duplicateRisk: 0,
      };
    }

    // High fidelity calculation
    const hasNora = stats.selectedNora > 0;
    const hasSam = stats.selectedSam > 0;
    const hasPro = stats.selectedPro > 0;
    const personaBalance = (hasNora ? 30 : 0) + (hasSam ? 30 : 0) + (hasPro ? 30 : 0);
    const volumeBonus = Math.min(totalSelected * 2, 10);
    const score = Math.min(Math.round(personaBalance + volumeBonus + 2), 98);

    return {
      ...mockSEOMetrics,
      compositeScore: score,
    };
  }, [selectedFaqIds, stats]);

  return (
    <GenerationContext.Provider
      value={{
        productInfo,
        setProductInfo,
        updateProductInfoField,
        faqs,
        selectedFaqIds,
        toggleFaqSelection,
        selectAllFaqs,
        deselectAllFaqs,
        autoBalanceFaqs,
        updateFaq,
        personaFilter,
        setPersonaFilter,
        isGenerating,
        startGenerating,
        seoMetrics,
        stats,
        resetWorkflow,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};
