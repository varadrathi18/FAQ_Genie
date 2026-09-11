import { api as client } from './client';
import { SaveSelectionResponse, SuggestFaqsResponse } from '../types';

export const faqsApi = {
  generateFaqs: async (projectId: string, generationId: string) => {
    return client.post<{ jobId: string, status: string, generationId: string }>(`/api/projects/${projectId}/generations/${generationId}/faqs/generate`);
  },

  saveFaqSelection: async (projectId: string, generationId: string, selectedFaqIds: string[]) => {
    return client.patch<SaveSelectionResponse>(`/api/projects/${projectId}/generations/${generationId}/faqs/selection`, { selectedFaqIds });
  },

  suggestFaqs: async (projectId: string, generationId: string) => {
    return client.post<SuggestFaqsResponse>(`/api/projects/${projectId}/generations/${generationId}/faqs/suggest`);
  }
};
