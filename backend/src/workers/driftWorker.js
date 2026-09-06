const { Worker, UnrecoverableError } = require('bullmq');
const { connection } = require('../queues/queueConnection');
const { calculateDrift } = require('../services/knowledgeDriftService');

const driftWorker = new Worker('driftQueue', async (job) => {
  const { projectId, knowledgeSourceId, userId } = job.data;

  if (!projectId || !knowledgeSourceId || !userId) {
    throw new Error(JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Missing identifiers' }));
  }

  await job.updateProgress(10);

  try {
    const drift = await calculateDrift(projectId, knowledgeSourceId, userId);
    await job.updateProgress(100);
    return { driftId: drift._id || null, status: drift.status };
  } catch (error) {
    const isDomainError = ['VALIDATION_ERROR', 'NOT_FOUND', 'BAD_REQUEST'].includes(error.code);
    const errObj = { 
      code: error.code || 'DRIFT_CALCULATION_FAILED', 
      message: error.message || 'Error calculating drift' 
    };
    if (isDomainError) {
      throw new UnrecoverableError(JSON.stringify(errObj));
    }
    throw new Error(JSON.stringify(errObj));
  }
}, {
  connection,
  concurrency: 2,
});

module.exports = driftWorker;
