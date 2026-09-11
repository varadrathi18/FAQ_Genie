export type PersonaType = 'nora' | 'sam' | 'pro';

export interface FAQ {
  id: string;
  persona: PersonaType;
  question: string;
  answer: string;
  intent?: string;
  intentConfidence?: number;
  sourceReferences?: any[];
  selected?: boolean;
  recommended?: boolean;
  category?: string;
  isVerified?: boolean;
  codeId?: string; // Keep for backward compatibility with mock UI if needed
}

export interface BackendSeoAnalysis {
  score: number;
  breakdown: {
    coverage: number;
    personaCoverage: number;
    uniqueness: number;
    answerCompleteness: number;
    sourceCoverage: number;
  };
  recommendations: string[];
  analyzedFaqCount: number;
  analyzedAt: string;
}

export interface SEOMetrics {
  compositeScore: number;
  questionQuality: number;
  topicCoverage: number;
  intentDiversity: number;
  personaCoverage: number;
  duplicateRisk: number;
  estimatedReadTime: string;
  recommendations: {
    text: string;
    tag?: string;
    type: 'check' | 'tip';
  }[];
}

export interface GenerationProductInfo {
  title: string;
  description: string;
  url?: string;
  category: 'new_feature' | 'major_release' | 'api_update';
  specFile?: {
    name: string;
    size: string;
  };
}

export interface PublicationTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface PublicationBrand {
  siteTitle: string;
  logoUrl: string | null;
}

export interface PublicationPreview {
  generationId: string;
  faqs: FAQ[];
  theme: PublicationTheme;
  brand: PublicationBrand;
}

export interface PublicationData {
  status: 'published' | 'unpublished';
  widgetId?: string;
  theme?: PublicationTheme;
  brand?: PublicationBrand;
  embedCode?: string;
  jsonLd?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface Generation {
  id: string;
  projectId?: string;
  projectName?: string; // Legacy / mock compatibility
  version: number | string;
  inputSnapshot?: GenerationProductInfo;
  productInfo?: GenerationProductInfo; // Legacy / mock compatibility
  selectedFaqIds?: string[];
  seoAnalysis?: any | null;
  publication?: PublicationData | null;
  createdAt?: string;
  updatedAt?: string;
  faqs?: FAQ[];
  faqCount?: number; // Legacy / mock compatibility
  seoScore?: number; // Legacy / mock compatibility
  lastUpdated?: string; // Legacy / mock compatibility
  status?: string; // Legacy / mock compatibility
}

export interface Project {
  id: string;
  title?: string;
  name?: string; // Legacy / mock compatibility
  description?: string;
  websiteUrl?: string;
  url?: string; // Legacy / mock compatibility
  status?: string;
  activeGenerations?: number; // Legacy / mock compatibility
  totalFaqs?: number; // Legacy / mock compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
}

export interface User extends BackendUser {
  avatarUrl?: string;
  role?: string;
  tier?: 'PRO TIER' | 'FREE TIER' | 'ENTERPRISE';
  isGuest?: boolean;
}

export interface JobStatus {
  jobId: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result: any | null;
  error: { code: string; message: string } | null;
}

export interface SaveSelectionResponse {
  generationId: string;
  selectedFaqIds: string[];
  selectedCount: number;
}

export interface SuggestFaqsResponse {
  generationId: string;
  suggestedFaqIds: string[];
  count: number;
}
