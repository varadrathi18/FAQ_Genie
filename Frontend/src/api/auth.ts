import { api } from './client';
import { BackendUser } from '../types';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
}

export const authApi = {
  async register(name: string, email: string, password?: string): Promise<BackendUser> {
    return api.post<BackendUser>('/api/auth/register', { name, email, password });
  },

  async login(email?: string, password?: string): Promise<BackendUser> {
    return api.post<BackendUser>('/api/auth/login', { email, password });
  },

  async logout(): Promise<void> {
    return api.post<void>('/api/auth/logout');
  },

  async getCurrentUser(): Promise<BackendUser> {
    return api.get<BackendUser>('/api/auth/me');
  },
};
