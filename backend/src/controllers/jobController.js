const knowledgeQueue = require('../queues/knowledgeQueue');
const faqQueue = require('../queues/faqQueue');
const driftQueue = require('../queues/driftQueue');

const getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    // Check all queues
    const queues = [knowledgeQueue, faqQueue, driftQueue];
    let job = null;

    for (const queue of queues) {
      job = await queue.getJob(jobId);
      if (job) break;
    }

    if (!job) {
      return res.status(404).json({ error: { message: 'Job not found.', code: 'NOT_FOUND' } });
    }

    // Job Ownership Isolation
    if (!job.data.userId || job.data.userId !== req.userId) {
      return res.status(403).json({ error: { message: 'Forbidden access to this job.', code: 'FORBIDDEN' } });
    }

    const state = await job.getState();
    let statusStr = 'queued';
    
    if (state === 'active') statusStr = 'processing';
    else if (state === 'completed') statusStr = 'completed';
    else if (state === 'failed') statusStr = 'failed';

    const response = {
      jobId: job.id,
      type: job.name,
      status: statusStr,
      progress: job.progress || 0,
      result: job.returnvalue || null,
      error: null
    };

    if (state === 'failed' && job.failedReason) {
      try {
        const parsedError = JSON.parse(job.failedReason);
        response.error = {
          code: parsedError.code || 'JOB_FAILED',
          message: parsedError.message || 'Job execution failed.'
        };
      } catch (e) {
        response.error = {
          code: 'JOB_FAILED',
          message: 'Job execution failed.'
        };
      }
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobStatus
};
