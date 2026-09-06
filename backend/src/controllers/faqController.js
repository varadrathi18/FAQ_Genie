const mongoose = require('mongoose');
const Project = require('../models/Project');
const Generation = require('../models/Generation');
const { generateFaqsForGeneration } = require('../services/faqGenerationService');

const generateFaqs = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(generationId)) {
      throw { status: 400, message: 'Invalid ID format.', code: 'BAD_REQUEST' };
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      throw { status: 404, message: 'Project not found.', code: 'NOT_FOUND' };
    }

    // Verify generation ownership
    const generation = await Generation.findOne({ _id: generationId, projectId, userId: req.userId });
    if (!generation) {
      throw { status: 404, message: 'Generation not found.', code: 'NOT_FOUND' };
    }

    // Call service to generate FAQs
    const result = await generateFaqsForGeneration(projectId, generationId, req.userId);

    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  generateFaqs
};
