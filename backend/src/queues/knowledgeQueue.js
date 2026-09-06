const { Queue } = require('bullmq');
const { connection } = require('./queueConnection');

const knowledgeQueue = new Queue('knowledgeQueue', { connection });

module.exports = knowledgeQueue;
