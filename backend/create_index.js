require('dotenv').config();
const mongoose = require('mongoose');

async function createIndex() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const collection = mongoose.connection.db.collection('knowledgechunks');
  
  try {
    const result = await collection.createSearchIndex({
      name: "knowledge_vector_index",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine"
          },
          {
            type: "filter",
            path: "projectId"
          },
          {
            type: "filter",
            path: "knowledgeSourceId"
          }
        ]
      },
      type: "vectorSearch"
    });
    console.log("Index creation initiated:", result);
  } catch (err) {
    console.error("Error creating index:", err);
  }
  
  setTimeout(() => mongoose.disconnect(), 2000);
}

createIndex();
