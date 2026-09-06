const { Queue } = require('bullmq');
const { connection } = require('./queueConnection');

const faqQueue = new Queue('faqQueue', { connection });

module.exports = faqQueue;
