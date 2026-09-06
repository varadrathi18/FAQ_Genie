const mongoose = require('mongoose');
const Project = require('../models/Project');
const Generation = require('../models/Generation');
const FAQ = require('../models/FAQ');
const { saveSelection, suggestBestFaqs } = require('../services/faqSelectionService');
const { analyzeFaqSet } = require('../services/seoService');
const faqQueue = require('../queues/faqQueue');

// Helper to verify project ownership
const verifyProjectAccess = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw { status: 400, message: 'Invalid project ID format.', code: 'BAD_REQUEST' };
  }
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw { status: 404, message: 'Project not found.', code: 'NOT_FOUND' };
  }
  return project;
};

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
    const activeJobs = await faqQueue.getJobs(['waiting', 'active', 'delayed']);
    let existingJob = activeJobs.find(j => j.data.generationId === generationId.toString());

    let jobId;
    if (existingJob) {
      jobId = existingJob.id;
    } else {
      jobId = `faq-${generationId}-${Date.now()}`;
      await faqQueue.add('faq.generate', { projectId, generationId, userId: req.userId }, {
        jobId,
        removeOnComplete: 100,
        removeOnFail: 500,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });
    }

    res.status(202).json({
      jobId,
      status: 'queued',
      generationId
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const saveFaqSelection = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    const { selectedFaqIds } = req.body;

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
      throw { status: 404, message: 'Generation not found.', code: 'NO_GENERATION' };
    }

    const result = await saveSelection(projectId, generationId, req.userId, selectedFaqIds);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const suggestFaqs = async (req, res, next) => {
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
      throw { status: 404, message: 'Generation not found.', code: 'NO_GENERATION' };
    }

    // Load all FAQs for this generation
    const faqs = await FAQ.find({ generationId, projectId, userId: req.userId });
    
    if (faqs.length === 0) {
      throw { status: 400, message: 'No generated FAQs found.', code: 'NO_FAQS' };
    }

    const suggestedFaqIds = suggestBestFaqs(faqs);
    
    res.status(200).json({
      generationId,
      suggestedFaqIds,
      count: suggestedFaqIds.length
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const analyzeSeo = async (req, res, next) => {
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
      throw { status: 404, message: 'Generation not found.', code: 'NO_GENERATION' };
    }

    const selectedFaqIds = generation.selectedFaqIds || [];
    if (selectedFaqIds.length === 0) {
      throw { status: 400, message: 'Select at least one FAQ before running SEO analysis.', code: 'NO_SELECTION' };
    }

    // Load precisely the selected FAQs
    const faqs = await FAQ.find({
      _id: { $in: selectedFaqIds },
      generationId,
      projectId,
      userId: req.userId
    });

    if (faqs.length !== selectedFaqIds.length) {
      throw { status: 400, message: 'One or more selected FAQs do not match the requested project/generation/user.', code: 'FAQ_GENERATION_MISMATCH' };
    }

    const seoResult = analyzeFaqSet(faqs);

    // Persist seoAnalysis
    generation.seoAnalysis = seoResult;
    await generation.save();

    res.status(200).json(seoResult);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  generateFaqs,
  saveFaqSelection,
  suggestFaqs,
  analyzeSeo
};
