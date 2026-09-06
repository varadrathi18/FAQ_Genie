require('dotenv').config();
const mongoose = require('mongoose');

async function listIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const collection = mongoose.connection.db.collection('knowledgechunks');
  
  try {
    const indexes = await collection.listSearchIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error("Error listing indexes:", err);
  }
  
  setTimeout(() => mongoose.disconnect(), 1000);
}

listIndexes();
