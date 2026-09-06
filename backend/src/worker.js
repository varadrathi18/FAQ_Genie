require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { connection: redisConnection } = require('./queues/queueConnection');

const knowledgeWorker = require('./workers/knowledgeWorker');
const faqWorker = require('./workers/faqWorker');
const driftWorker = require('./workers/driftWorker');

const workers = [knowledgeWorker, faqWorker, driftWorker];

const startWorker = async () => {
  try {
    await connectDB();
    console.log('Worker process connected to MongoDB and waiting for jobs...');
    
    workers.forEach(w => {
      w.on('completed', job => {
        console.log(`[${w.name}] Job ${job.id} completed!`);
      });
      w.on('failed', (job, err) => {
        console.error(`[${w.name}] Job ${job.id} failed with ${err.message}`);
      });
    });
  } catch (error) {
    console.error('Failed to start worker:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('Initiating graceful shutdown of workers...');
  
  try {
    for (const worker of workers) {
      await worker.close();
    }
    console.log('All workers stopped.');
    
    redisConnection.disconnect();
    console.log('Redis disconnected.');

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startWorker();
