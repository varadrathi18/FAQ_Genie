export type PersonaType = 'nora' | 'sam' | 'pro';

export interface FAQ {
  id: string;
  codeId: string; // e.g. "NORA-01", "SAM-02", "PRO-01"
  persona: PersonaType;
  question: string;
  answer: string;
  recommended?: boolean;
  category?: string;
  isVerified?: boolean;
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
  url: string;
  category: 'new_feature' | 'major_release' | 'api_update';
  specFile?: {
    name: string;
    size: string;
  };
}

export interface Generation {
  id: string;
  projectName: string;
  version: string;
  faqCount: number;
  seoScore: number;
  lastUpdated: string;
  productInfo: GenerationProductInfo;
  selectedFaqIds: string[];
  status: 'active' | 'draft' | 'archived';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  tier: 'PRO TIER' | 'FREE TIER' | 'ENTERPRISE';
  isGuest?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  activeGenerations: number;
  totalFaqs: number;
  updatedAt: string;
}
