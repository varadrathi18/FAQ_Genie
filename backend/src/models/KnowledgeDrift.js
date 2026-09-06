const mongoose = require('mongoose');

const knowledgeDriftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    previousVersion: {
      type: Number,
      required: true,
    },
    currentVersion: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['detected', 'reviewed', 'resolved'],
      default: 'detected',
      index: true,
    },
    driftScore: {
      type: Number,
      required: true,
    },
    driftLevel: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high'],
      required: true,
    },
    changedChunks: [
      {
        type: { type: String, enum: ['added', 'removed', 'modified'], required: true },
        previousChunkId: { type: mongoose.Schema.Types.ObjectId, default: null },
        currentChunkId: { type: mongoose.Schema.Types.ObjectId, default: null },
        similarity: { type: Number, default: null },
        previousHash: { type: String, default: null },
        currentHash: { type: String, default: null },
      }
    ],
    affectedFaqs: [
      {
        faqId: { type: mongoose.Schema.Types.ObjectId, ref: 'FAQ' },
        similarity: { type: Number },
        reason: { type: String },
      }
    ],
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

knowledgeDriftSchema.index({ knowledgeSourceId: 1, previousVersion: 1, currentVersion: 1 }, { unique: true });

module.exports = mongoose.model('KnowledgeDrift', knowledgeDriftSchema);
