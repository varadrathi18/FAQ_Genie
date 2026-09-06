const Generation = require('../models/Generation');
const Project = require('../models/Project');
const FAQ = require('../models/FAQ');
const mongoose = require('mongoose');

const formatGeneration = (gen) => ({
  id: gen._id,
  projectId: gen.projectId,
  version: gen.version,
  inputSnapshot: gen.inputSnapshot,
  selectedFaqIds: gen.selectedFaqIds,
  seoAnalysis: gen.seoAnalysis,
  publication: gen.publication,
  createdAt: gen.createdAt,
  updatedAt: gen.updatedAt,
});

// Reusable check for project ownership
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

const createGeneration = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const { inputSnapshot } = req.body;
    if (!inputSnapshot || typeof inputSnapshot !== 'object' || Array.isArray(inputSnapshot)) {
      return res.status(400).json({
        error: { message: 'inputSnapshot is required and must be an object.', code: 'BAD_REQUEST' }
      });
    }

    // Determine version
    const latest = await Generation.findOne({ projectId }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    try {
      const generation = await Generation.create({
        projectId,
        userId: req.userId,
        version,
        inputSnapshot,
        selectedFaqIds: [],
        seoAnalysis: null,
        publication: null
      });
      res.status(201).json(formatGeneration(generation));
    } catch (err) {
      if (err.code === 11000) {
        // Race condition: another request took this version
        return res.status(409).json({
          error: { message: 'Version conflict. Please try again.', code: 'CONFLICT' }
        });
      }
      throw err;
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const createNextGeneration = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const latest = await Generation.findOne({ projectId }).sort({ version: -1 });
    if (!latest) {
      return res.status(400).json({
        error: { message: 'Cannot create next generation: no existing generation found.', code: 'BAD_REQUEST' }
      });
    }

    const version = latest.version + 1;

    try {
      const generation = await Generation.create({
        projectId,
        userId: req.userId,
        version,
        inputSnapshot: latest.inputSnapshot,
        selectedFaqIds: [],
        seoAnalysis: null,
        publication: null
      });
      res.status(201).json(formatGeneration(generation));
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          error: { message: 'Version conflict. Please try again.', code: 'CONFLICT' }
        });
      }
      throw err;
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const getGenerations = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const generations = await Generation.find({ projectId }).sort({ createdAt: -1 }).lean();

    const faqCounts = await FAQ.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId), userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$generationId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    for (const item of faqCounts) {
      countMap[item._id.toString()] = item.count;
    }

    const history = generations.map(gen => ({
      generationId: gen._id,
      version: gen.version,
      createdAt: gen.createdAt,
      faqCount: countMap[gen._id.toString()] || 0,
      selectedFaqCount: gen.selectedFaqIds ? gen.selectedFaqIds.length : 0,
      seoScore: gen.seoAnalysis ? gen.seoAnalysis.score : null,
      publicationStatus: gen.publication ? gen.publication.status : null
    }));

    res.status(200).json({ generations: history });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const getGeneration = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    if (!mongoose.Types.ObjectId.isValid(generationId)) {
      return res.status(400).json({
        error: { message: 'Invalid generation ID format.', code: 'BAD_REQUEST' }
      });
    }

    const generation = await Generation.findOne({ _id: generationId, projectId, userId: req.userId });
    if (!generation) {
      return res.status(404).json({
        error: { message: 'Generation not found.', code: 'NOT_FOUND' }
      });
    }

    const rawFaqs = await FAQ.find({ generationId, projectId, userId: req.userId }).lean();
    
    const selectedSet = new Set((generation.selectedFaqIds || []).map(id => id.toString()));

    const faqs = rawFaqs.map(faq => ({
      id: faq._id,
      persona: faq.persona,
      question: faq.question,
      answer: faq.answer,
      intent: faq.intent,
      intentConfidence: faq.intentConfidence,
      sourceReferences: faq.sourceReferences,
      selected: selectedSet.has(faq._id.toString())
    }));

    const formatted = formatGeneration(generation);
    formatted.faqs = faqs;

    res.status(200).json(formatted);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const updateGeneration = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    if (!mongoose.Types.ObjectId.isValid(generationId)) {
      return res.status(400).json({
        error: { message: 'Invalid generation ID format.', code: 'BAD_REQUEST' }
      });
    }

    const generation = await Generation.findOne({ _id: generationId, projectId, userId: req.userId });
    if (!generation) {
      return res.status(404).json({
        error: { message: 'Generation not found.', code: 'NOT_FOUND' }
      });
    }

    const { selectedFaqIds, seoAnalysis, publication } = req.body;

    if (selectedFaqIds !== undefined) {
      if (!Array.isArray(selectedFaqIds)) {
        return res.status(400).json({
          error: { message: 'selectedFaqIds must be an array of ObjectId strings.', code: 'BAD_REQUEST' }
        });
      }
      for (const id of selectedFaqIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            error: { message: `Invalid ObjectId in selectedFaqIds: ${id}`, code: 'BAD_REQUEST' }
          });
        }
      }
      generation.selectedFaqIds = selectedFaqIds;
    }

    if (seoAnalysis !== undefined) {
      if (seoAnalysis !== null && (typeof seoAnalysis !== 'object' || Array.isArray(seoAnalysis))) {
        return res.status(400).json({
          error: { message: 'seoAnalysis must be an object or null.', code: 'BAD_REQUEST' }
        });
      }
      generation.seoAnalysis = seoAnalysis;
    }

    if (publication !== undefined) {
      if (publication !== null && (typeof publication !== 'object' || Array.isArray(publication))) {
        return res.status(400).json({
          error: { message: 'publication must be an object or null.', code: 'BAD_REQUEST' }
        });
      }
      generation.publication = publication;
    }

    await generation.save();
    res.status(200).json(formatGeneration(generation));
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  createGeneration,
  createNextGeneration,
  getGenerations,
  getGeneration,
  updateGeneration,
};
