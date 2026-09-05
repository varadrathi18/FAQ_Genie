const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    inputSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    selectedFaqIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FAQ',
      },
    ],
    seoAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    publication: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for projectId and version
generationSchema.index({ projectId: 1, version: 1 }, { unique: true });

const Generation = mongoose.model('Generation', generationSchema);

module.exports = Generation;
