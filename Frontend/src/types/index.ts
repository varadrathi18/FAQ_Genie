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
  projectId: string;
  version: number;
  inputSnapshot: GenerationProductInfo;
  selectedFaqIds: string[];
  seoAnalysis: BackendSeoAnalysis | null;
  publication: PublicationData | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationDetail extends Generation {
  faqs: FAQ[];
}

export interface HistoryGeneration {
  generationId: string;
  projectId: string;
  projectName: string;
  projectUrl?: string;
  projectDescription?: string;
  version: number;
  createdAt: string;
  faqCount: number;
  selectedFaqCount: number;
  seoScore: number | null;
  publicationStatus: 'published' | 'unpublished' | null;
}

export interface DashboardOverview {
  projectCount: number;
  faqCount: number;
  selectedFaqCount: number;
  averageSeoScore: number | null;
  publishedCount: number;
}

export interface DashboardRecentProject {
  projectId: string;
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  latestGeneration: {
    generationId: string;
    version: number;
    seoScore: number | null;
    publicationStatus: string | null;
  } | null;
}

export interface DashboardRecentGeneration {
  generationId: string;
  projectId: string;
  projectTitle: string;
  version: number;
  faqCount: number;
  selectedFaqCount: number;
  seoScore: number | null;
  publicationStatus: string | null;
  createdAt: string;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  recentProjects: DashboardRecentProject[];
  recentGenerations: DashboardRecentGeneration[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  websiteUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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

export type KnowledgeSourceType = 'website' | 'text';
export type KnowledgeSourceStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface KnowledgeSource {
  id: string;
  type: KnowledgeSourceType;
  url?: string;
  title?: string;
  status: KnowledgeSourceStatus;
  currentVersion?: number;
  lastFetchedAt: string | null;
  error: string | null;
  chunkCount?: number;
}

export type KnowledgeDriftStatus = 'detected' | 'reviewed' | 'resolved';
export type KnowledgeDriftLevel = 'none' | 'low' | 'moderate' | 'high';

export interface ChangedKnowledgeChunk {
  type: 'added' | 'removed' | 'modified';
  previousChunkId?: string | null;
  currentChunkId?: string | null;
  similarity?: number | null;
  previousHash?: string | null;
  currentHash?: string | null;
}

export interface AffectedFAQ {
  faqId: string;
  similarity?: number;
  reason?: string;
}

export interface KnowledgeDriftSummary {
  driftId: string;
  knowledgeSourceId: string;
  previousVersion: number;
  currentVersion: number;
  status: KnowledgeDriftStatus;
  driftScore: number;
  driftLevel: KnowledgeDriftLevel;
  changedChunkCount: number;
  affectedFaqCount: number;
  detectedAt: string;
}

export interface KnowledgeDriftDetail extends KnowledgeDriftSummary {
  userId: string;
  projectId: string;
  changedChunks: ChangedKnowledgeChunk[];
  affectedFaqs: AffectedFAQ[];
  resolvedAt?: string | null;
}

