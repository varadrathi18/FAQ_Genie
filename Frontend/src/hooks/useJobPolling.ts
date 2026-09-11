import { useState, useRef, useEffect, useCallback } from 'react';
import { jobsApi } from '../api/jobs';
import { JobStatus } from '../types';

export const useJobPolling = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  
  const pollingRef = useRef<number | NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollJob = useCallback((jobId: string): Promise<any> => {
    stopPolling();
    setIsPolling(true);
    setJobStatus(null);
    
    let attempts = 0;
    const MAX_ATTEMPTS = 60;
    
    return new Promise((resolve, reject) => {
      const executePoll = async () => {
        try {
          const response = await jobsApi.getJobStatus(jobId);
          setJobStatus(response);

          if (response.status === 'completed') {
            setIsPolling(false);
            resolve(response.result);
          } else if (response.status === 'failed') {
            setIsPolling(false);
            reject(new Error(response.error?.message || 'Job failed'));
          } else {
            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
              setIsPolling(false);
              reject(new Error('Job polling timed out'));
              return;
            }
            // Still processing or queued
            pollingRef.current = setTimeout(executePoll, 2000);
          }
        } catch (err: any) {
          setIsPolling(false);
          reject(new Error(err.message || 'Failed to check job status'));
        }
      };

      executePoll();
    });
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    isPolling,
    jobStatus,
    pollJob,
    stopPolling
  };
};
