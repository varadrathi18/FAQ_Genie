const { Worker, UnrecoverableError } = require('bullmq');
const { connection } = require('../queues/queueConnection');
const { processWebsiteSource } = require('../services/knowledgeService');

const knowledgeWorker = new Worker('knowledgeQueue', async (job) => {
  const { sourceId, userId } = job.data;
  
  if (!sourceId || !userId) {
    throw new Error(JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Missing sourceId or userId' }));
  }

  await job.updateProgress(10);
  
  try {
    await processWebsiteSource(sourceId);
    await job.updateProgress(100);
    return { sourceId };
  } catch (error) {
    const isDomainError = ['VALIDATION_ERROR', 'NOT_FOUND', 'INSUFFICIENT_KNOWLEDGE', 'BAD_REQUEST'].includes(error.code);
    const errObj = { 
      code: error.code || 'INGESTION_ERROR', 
      message: error.message || 'Error processing knowledge source' 
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

module.exports = knowledgeWorker;
