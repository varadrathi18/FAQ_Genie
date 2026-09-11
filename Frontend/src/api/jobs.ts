import { api as client } from './client';
import { JobStatus } from '../types';

export const jobsApi = {
  getJobStatus: async (jobId: string) => {
    return client.get<JobStatus>(`/api/jobs/${jobId}`);
  }
};
