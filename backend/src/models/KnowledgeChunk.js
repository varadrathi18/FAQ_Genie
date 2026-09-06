const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    knowledgeSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeSource',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      index: true,
    },
    contentHash: {
      type: String,
      required: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    embedding: {
      type: [Number],
      required: false, // Optional during migration/creation
    },
    embeddingModel: {
      type: String,
      default: 'sentence-transformers/all-mpnet-base-v2',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
