import { api as client } from './client';
import { KnowledgeSource } from '../types';

export const knowledgeApi = {
  ingestWebsite: async (projectId: string, url: string) => {
    return client.post<{ jobId: string; status: string; sourceId: string }>(
      `/api/projects/${projectId}/knowledge/website`,
      { url }
    );
  },

  ingestText: async (projectId: string, title: string, text: string) => {
    return client.post<{ jobId: string; status: string; sourceId: string }>(
      `/api/projects/${projectId}/knowledge/text`,
      { title, text }
    );
  },

  getKnowledgeSources: async (projectId: string) => {
    return client.get<{ sources: KnowledgeSource[] }>(`/api/projects/${projectId}/knowledge`);
  },

  getKnowledgeSource: async (projectId: string, sourceId: string) => {
    return client.get<KnowledgeSource & { projectId: string; chunkCount: number }>(
      `/api/projects/${projectId}/knowledge/${sourceId}`
    );
  },

  deleteKnowledgeSource: async (projectId: string, sourceId: string) => {
    return client.delete<{ status: string; message: string }>(
      `/api/projects/${projectId}/knowledge/${sourceId}`
    );
  }
};
