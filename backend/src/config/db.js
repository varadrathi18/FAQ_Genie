const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables.');
  }
  
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connection successful.');
  } catch (error) {
    if (error.message && error.message.includes('IP')) {
      throw new Error(`\n[MONGODB ATLAS BLOCKED] Failed to connect to MongoDB Atlas. Your machine's public IP address is NOT allowlisted in the Atlas Network Access panel.\nOriginal Error: ${error.message}`);
    }
    throw new Error(`\n[MONGODB CONNECTION FAILED] Could not connect to database. Please check your MONGODB_URI credentials and cluster status.\nOriginal Error: ${error.message}`);
  }
};

module.exports = connectDB;
