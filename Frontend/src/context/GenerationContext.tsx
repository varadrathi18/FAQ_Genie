import React, { createContext, useContext, useState, useMemo } from 'react';
import { FAQ, GenerationProductInfo, BackendSeoAnalysis } from '../types';
import { faqsApi } from '../api/faqs';
import { seoApi } from '../api/seo';
import { publicationApi } from '../api/publication';
import { PublicationData, PublicationPreview } from '../types';

interface GenerationContextType {
  productInfo: GenerationProductInfo;
  setProductInfo: React.Dispatch<React.SetStateAction<GenerationProductInfo>>;
  updateProductInfoField: (field: keyof GenerationProductInfo, value: any) => void;
  faqs: FAQ[];
  setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
  selectedFaqIds: string[];
  toggleFaqSelection: (id: string) => void;
  selectAllFaqs: () => void;
  deselectAllFaqs: () => void;
  updateFaq: (id: string, updated: Partial<FAQ>) => void;
  personaFilter: 'all' | 'nora' | 'sam' | 'pro';
  setPersonaFilter: (filter: 'all' | 'nora' | 'sam' | 'pro') => void;
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
  projectId: string | null;
  setProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  generationId: string | null;
  setGenerationId: React.Dispatch<React.SetStateAction<string | null>>;
  resetWorkflow: () => void;
  isSavingSelection: boolean;
  isSuggestingFaqs: boolean;
  selectionError: string | null;
  suggestionError: string | null;
  saveSelection: () => Promise<void>;
  suggestBestFaqs: () => Promise<void>;
  seoAnalysis: BackendSeoAnalysis | null;
  setSeoAnalysis: React.Dispatch<React.SetStateAction<BackendSeoAnalysis | null>>;
  isAnalyzingSeo: boolean;
  seoError: string | null;
  analyzeSeo: () => Promise<BackendSeoAnalysis | undefined>;
  publicationPreview: PublicationPreview | null;
  publication: PublicationData | null;
  isLoadingPublication: boolean;
  isPublishing: boolean;
  publicationError: string | null;
  loadPublicationPreview: () => Promise<void>;
  publishGeneration: () => Promise<void>;
  unpublishGeneration: () => Promise<void>;
}

const initialProductInfo: GenerationProductInfo = {
  title: '',
  description: '',
  url: '',
  category: 'new_feature',
};

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productInfo, setProductInfo] = useState<GenerationProductInfo>(initialProductInfo);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>([]);
  const [personaFilter, setPersonaFilter] = useState<'all' | 'nora' | 'sam' | 'pro'>('all');
  
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [isSuggestingFaqs, setIsSuggestingFaqs] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<BackendSeoAnalysis | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  
  const [publicationPreview, setPublicationPreview] = useState<PublicationPreview | null>(null);
  const [publication, setPublication] = useState<PublicationData | null>(null);
  const [isLoadingPublication, setIsLoadingPublication] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publicationError, setPublicationError] = useState<string | null>(null);

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

  const updateFaq = (id: string, updated: Partial<FAQ>) => {
    setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, ...updated } : faq)));
  };

  const resetWorkflow = () => {
    setProductInfo(initialProductInfo);
    setProjectId(null);
    setGenerationId(null);
    setFaqs([]);
    setSelectedFaqIds([]);
    setPersonaFilter('all');
    setSelectionError(null);
    setSuggestionError(null);
    setSeoAnalysis(null);
    setSeoError(null);
    setPublicationPreview(null);
    setPublication(null);
    setPublicationError(null);
  };

  const saveSelection = async () => {
    if (!projectId || !generationId) {
      const msg = 'Missing project or generation ID';
      setSelectionError(msg);
      throw new Error(msg);
    }
    setIsSavingSelection(true);
    setSelectionError(null);
    try {
      await faqsApi.saveFaqSelection(projectId, generationId, selectedFaqIds);
      setSeoAnalysis(null);
    } catch (err: any) {
      const msg = err.message || 'Failed to save selection';
      setSelectionError(msg);
      throw new Error(msg);
    } finally {
      setIsSavingSelection(false);
    }
  };

  const suggestBestFaqs = async () => {
    if (!projectId || !generationId) {
      const msg = 'Missing project or generation ID';
      setSuggestionError(msg);
      throw new Error(msg);
    }
    setIsSuggestingFaqs(true);
    setSuggestionError(null);
    try {
      const response = await faqsApi.suggestFaqs(projectId, generationId);
      setSelectedFaqIds(response.suggestedFaqIds);
      await faqsApi.saveFaqSelection(projectId, generationId, response.suggestedFaqIds);
      setSeoAnalysis(null);
    } catch (err: any) {
      const msg = err.message || 'Failed to suggest FAQs';
      setSuggestionError(msg);
      throw new Error(msg);
    } finally {
      setIsSuggestingFaqs(false);
    }
  };

  const analyzeSeo = async () => {
    if (!projectId || !generationId) {
      const msg = 'Missing project or generation ID';
      setSeoError(msg);
      throw new Error(msg);
    }
    if (selectedFaqIds.length === 0) {
      const msg = 'Please select at least one FAQ to analyze';
      setSeoError(msg);
      throw new Error(msg);
    }
    setIsAnalyzingSeo(true);
    setSeoError(null);
    try {
      const response = await seoApi.analyzeSeo(projectId, generationId);
      setSeoAnalysis(response);
      return response;
    } catch (err: any) {
      const msg = err.message || 'Failed to analyze SEO';
      setSeoError(msg);
      if (err.code === 'NO_SELECTION' || err.code === 'FAQ_GENERATION_MISMATCH') {
        setSeoAnalysis(null);
      }
      throw new Error(msg);
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  const loadPublicationPreview = async () => {
    if (!projectId || !generationId) return;
    setIsLoadingPublication(true);
    setPublicationError(null);
    try {
      const result = await publicationApi.getPublicationPreview(projectId, generationId);
      setPublicationPreview(result);
    } catch (err: any) {
      setPublicationError(err.message || 'Failed to load publication preview');
    } finally {
      setIsLoadingPublication(false);
    }
  };

  const publishGeneration = async () => {
    if (!projectId || !generationId) {
      const msg = 'Missing project or generation ID';
      setPublicationError(msg);
      throw new Error(msg);
    }
    setIsPublishing(true);
    setPublicationError(null);
    try {
      const result = await publicationApi.publishGeneration(projectId, generationId);
      setPublication(result);
    } catch (err: any) {
      const msg = err.message || 'Failed to publish generation';
      setPublicationError(msg);
      throw new Error(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublishGeneration = async () => {
    if (!projectId || !generationId) {
      const msg = 'Missing project or generation ID';
      setPublicationError(msg);
      throw new Error(msg);
    }
    setIsPublishing(true); // Reuse isPublishing for unpublish loading state
    setPublicationError(null);
    try {
      const result = await publicationApi.unpublishGeneration(projectId, generationId);
      if (publication) {
        setPublication({ ...publication, status: result.status as any });
      } else {
        setPublication({ status: result.status as any });
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to unpublish generation';
      setPublicationError(msg);
      throw new Error(msg);
    } finally {
      setIsPublishing(false);
    }
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

  return (
    <GenerationContext.Provider
      value={{
        productInfo,
        setProductInfo,
        updateProductInfoField,
        faqs,
        setFaqs,
        selectedFaqIds,
        toggleFaqSelection,
        selectAllFaqs,
        deselectAllFaqs,
        updateFaq,
        personaFilter,
        setPersonaFilter,
        stats,
        projectId,
        setProjectId,
        generationId,
        setGenerationId,
        resetWorkflow,
        isSavingSelection,
        isSuggestingFaqs,
        selectionError,
        suggestionError,
        saveSelection,
        suggestBestFaqs,
        seoAnalysis,
        setSeoAnalysis,
        isAnalyzingSeo,
        seoError,
        analyzeSeo,
        publicationPreview,
        publication,
        isLoadingPublication,
        isPublishing,
        publicationError,
        loadPublicationPreview,
        publishGeneration,
        unpublishGeneration,
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
