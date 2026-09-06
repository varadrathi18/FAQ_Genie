const { Queue } = require('bullmq');
const { connection } = require('./queueConnection');

const driftQueue = new Queue('driftQueue', { connection });

module.exports = driftQueue;
