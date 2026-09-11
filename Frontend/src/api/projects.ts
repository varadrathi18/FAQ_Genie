import { api as client } from './client';
import { Project } from '../types';

export const projectsApi = {
  createProject: async (data: { title: string; description: string; websiteUrl?: string }) => {
    return client.post<Project>('/api/projects', data);
  },

  getProjects: async () => {
    return client.get<{ projects: Project[] }>('/api/projects');
  },

  getProject: async (projectId: string) => {
    return client.get<Project>(`/api/projects/${projectId}`);
  },

  updateProject: async (projectId: string, data: Partial<{ title: string; description: string; websiteUrl: string }>) => {
    return client.patch<Project>(`/api/projects/${projectId}`, data);
  },

  archiveProject: async (projectId: string) => {
    return client.patch<Project>(`/api/projects/${projectId}/archive`);
  }
};
