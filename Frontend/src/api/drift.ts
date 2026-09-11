import { api as client } from './client';
import { KnowledgeDriftSummary, KnowledgeDriftDetail, KnowledgeDriftStatus } from '../types';

export const driftApi = {
  detectDrift: async (projectId: string, knowledgeSourceId: string) => {
    return client.post<{ jobId: string; status: string; knowledgeSourceId: string }>(
      `/api/projects/${projectId}/knowledge/drift`,
      { knowledgeSourceId }
    );
  },

  getDriftList: async (projectId: string) => {
    return client.get<KnowledgeDriftSummary[]>(`/api/projects/${projectId}/knowledge/drift`);
  },

  updateDriftStatus: async (projectId: string, driftId: string, status: KnowledgeDriftStatus) => {
    return client.patch<KnowledgeDriftDetail>(
      `/api/projects/${projectId}/knowledge/drift/${driftId}`,
      { status }
    );
  }
};
