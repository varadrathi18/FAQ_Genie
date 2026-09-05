const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables.');
  }
  
  await mongoose.connect(uri);
  console.log('MongoDB connection successful.');
};

module.exports = connectDB;
