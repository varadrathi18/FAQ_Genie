const { Worker, UnrecoverableError } = require('bullmq');
const { connection } = require('../queues/queueConnection');
const { generateFaqsForGeneration } = require('../services/faqGenerationService');

const faqWorker = new Worker('faqQueue', async (job) => {
  const { projectId, generationId, userId } = job.data;
  
  if (!projectId || !generationId || !userId) {
    throw new Error(JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Missing identifiers' }));
  }

  await job.updateProgress(10);

  try {
    const result = await generateFaqsForGeneration(projectId, generationId, userId);
    await job.updateProgress(100);
    
    const noraCount = result.faqs.nora ? result.faqs.nora.length : 0;
    const samCount = result.faqs.sam ? result.faqs.sam.length : 0;
    const proCount = result.faqs.pro ? result.faqs.pro.length : 0;
    const faqCount = noraCount + samCount + proCount;
    
    return { generationId, faqCount };
  } catch (error) {
    const isDomainError = ['VALIDATION_ERROR', 'NOT_FOUND', 'INSUFFICIENT_KNOWLEDGE', 'FAQ_GENERATION_INCOMPLETE', 'BAD_REQUEST'].includes(error.code);
    const errObj = { 
      code: error.code || 'FAQ_GENERATION_FAILED', 
      message: error.message || 'Error generating FAQs' 
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

module.exports = faqWorker;
