import { api as client } from './client';
import { Generation } from '../types';

export const generationsApi = {
  createGeneration: async (projectId: string, payload: { inputSnapshot: any }) => {
    return client.post<Generation>(`/api/projects/${projectId}/generations`, payload);
  },

  createNextGeneration: async (projectId: string) => {
    return client.post<Generation>(`/api/projects/${projectId}/generations/next`);
  },

  getGenerations: async (projectId: string) => {
    // The backend returns an array of generation history items in { generations: [...] }
    return client.get<{ generations: any[] }>(`/api/projects/${projectId}/generations`);
  },

  getGeneration: async (projectId: string, generationId: string) => {
    return client.get<Generation>(`/api/projects/${projectId}/generations/${generationId}`);
  },

  updateGeneration: async (projectId: string, generationId: string, payload: { selectedFaqIds?: string[], seoAnalysis?: any, publication?: any }) => {
    return client.patch<Generation>(`/api/projects/${projectId}/generations/${generationId}`, payload);
  }
};
