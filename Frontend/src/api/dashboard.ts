import { api as client } from './client';
import { DashboardResponse } from '../types';

export const dashboardApi = {
  getDashboard: async () => {
    return client.get<DashboardResponse>('/api/dashboard');
  }
};
