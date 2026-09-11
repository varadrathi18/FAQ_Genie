import { api as client } from './client';
import { BackendSeoAnalysis } from '../types';

export const seoApi = {
  analyzeSeo: async (projectId: string, generationId: string) => {
    return client.post<BackendSeoAnalysis>(`/api/projects/${projectId}/generations/${generationId}/seo/analyze`);
  }
};
