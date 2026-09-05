const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    generationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation',
      required: true,
      index: true,
    },
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
    persona: {
      type: String,
      enum: ['nora', 'sam', 'pro'],
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    intent: {
      type: String,
    },
    intentConfidence: {
      type: Number,
    },
    sourceReferences: {
      type: Array,
      default: [],
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
