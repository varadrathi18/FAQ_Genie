import { api } from './client';
import { PublicationPreview, PublicationData } from '../types';

export const publicationApi = {
  getPublicationPreview: (projectId: string, generationId: string) =>
    api.get<PublicationPreview>(`/api/projects/${projectId}/generations/${generationId}/publication/preview`),

  publishGeneration: (projectId: string, generationId: string) =>
    api.post<PublicationData>(`/api/projects/${projectId}/generations/${generationId}/publication`),

  unpublishGeneration: (projectId: string, generationId: string) =>
    api.delete<{ generationId: string; status: string }>(`/api/projects/${projectId}/generations/${generationId}/publication`),
};
