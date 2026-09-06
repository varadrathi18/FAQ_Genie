const KnowledgeChunk = require('../models/KnowledgeChunk');
const KnowledgeSource = require('../models/KnowledgeSource');
const { generateEmbedding } = require('./embeddingService');
const mongoose = require('mongoose');

const searchKnowledge = async (projectId, query, topK = 5) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Query must be a valid string');
  }

  // 1. Fetch ready source IDs for this project
  const readySources = await KnowledgeSource.find(
    { projectId, status: 'ready' },
    { _id: 1 }
  );

  if (readySources.length === 0) {
    return []; // No ready sources, skip search
  }

  const readySourceIds = readySources.map(s => s._id);

  // 2. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 3. Perform MongoDB vector search
  // Using $vectorSearch aggregate pipeline stage (requires Atlas)
  const pipeline = [
    {
      $vectorSearch: {
        index: 'knowledge_vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK,
        filter: {
          $and: [
            { projectId: new mongoose.Types.ObjectId(projectId) },
            { knowledgeSourceId: { $in: readySourceIds } }
          ]
        },
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        text: 1,
        sourceUrl: 1,
        knowledgeSourceId: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ];

  try {
    const results = await KnowledgeChunk.aggregate(pipeline);
    return results;
  } catch (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }
};

module.exports = {
  searchKnowledge,
};
