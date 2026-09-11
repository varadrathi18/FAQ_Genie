const Project = require('../models/Project');
const KnowledgeSource = require('../models/KnowledgeSource');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const { resolveAndCheckSSRF } = require('../services/websiteScraper');
const { runWebsiteIngestionAsync } = require('../services/knowledgeService');
const { searchKnowledge } = require('../services/vectorSearchService');
const { askQuestion } = require('../services/ragService');
const mongoose = require('mongoose');
const knowledgeQueue = require('../queues/knowledgeQueue');

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

const ingestWebsite = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({
        error: { message: 'Website URL is required.', code: 'BAD_REQUEST' }
      });
    }

    const trimmedUrl = url.trim();
    if (!(await resolveAndCheckSSRF(trimmedUrl))) {
      return res.status(400).json({
        error: { message: 'Website URL is invalid or not permitted.', code: 'BAD_REQUEST' }
      });
    }

    let source = await KnowledgeSource.findOne({ projectId, userId: req.userId, url: trimmedUrl, type: 'website' });

    const activeJobs = await knowledgeQueue.getJobs(['waiting', 'active', 'delayed']);
    // Only check active duplicates if the source exists
    if (source) {
      let existingJob = activeJobs.find(j => j.data.sourceId === source._id.toString());
      if (existingJob) {
        return res.status(202).json({
          jobId: existingJob.id,
          status: 'queued',
          sourceId: source._id
        });
      }
    }

    if (!source) {
      source = await KnowledgeSource.create({
        projectId,
        userId: req.userId,
        type: 'website',
        url: trimmedUrl,
        status: 'pending'
      });
    } else {
      source.status = 'pending';
      source.error = null;
      await source.save();
    }

    const jobId = `knowledge-${source._id}-${Date.now()}`;
    await knowledgeQueue.add('knowledge.ingest', { sourceId: source._id, userId: req.userId }, {
      jobId,
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      sourceId: source._id
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const ingestText = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const { title, text } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: { message: 'Title is required.', code: 'BAD_REQUEST' }
      });
    }
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: { message: 'Text content is required.', code: 'BAD_REQUEST' }
      });
    }

    // Since text can be repeatedly updated, we will create a generic source or update the latest one for this project
    let source = await KnowledgeSource.findOne({ projectId, userId: req.userId, type: 'text', title: title.trim() });

    if (!source) {
      source = await KnowledgeSource.create({
        projectId,
        userId: req.userId,
        type: 'text',
        title: title.trim(),
        status: 'pending'
      });
    } else {
      source.status = 'pending';
      source.error = null;
      await source.save();
    }

    const jobId = `knowledge-text-${source._id}-${Date.now()}`;
    await knowledgeQueue.add('knowledge.ingestText', { sourceId: source._id, userId: req.userId, text: text.trim() }, {
      jobId,
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      sourceId: source._id
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const getKnowledgeSources = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const sources = await KnowledgeSource.find({ projectId, userId: req.userId }).sort({ updatedAt: -1 });

    const formattedSources = sources.map(s => ({
      id: s._id,
      type: s.type,
      url: s.url,
      title: s.title,
      status: s.status,
      lastFetchedAt: s.lastFetchedAt,
      error: s.error
    }));

    res.status(200).json({ sources: formattedSources });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const getKnowledgeSource = async (req, res, next) => {
  try {
    const { projectId, sourceId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({
        error: { message: 'Invalid source ID format.', code: 'BAD_REQUEST' }
      });
    }

    const source = await KnowledgeSource.findOne({ _id: sourceId, projectId, userId: req.userId });
    if (!source) {
      return res.status(404).json({
        error: { message: 'Knowledge source not found.', code: 'NOT_FOUND' }
      });
    }

    const chunkCount = await KnowledgeChunk.countDocuments({ knowledgeSourceId: source._id });

    res.status(200).json({
      id: source._id,
      projectId: source.projectId,
      type: source.type,
      url: source.url,
      title: source.title,
      status: source.status,
      lastFetchedAt: source.lastFetchedAt,
      error: source.error,
      chunkCount
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const deleteKnowledgeSource = async (req, res, next) => {
  try {
    const { projectId, sourceId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res.status(400).json({
        error: { message: 'Invalid source ID format.', code: 'BAD_REQUEST' }
      });
    }

    const source = await KnowledgeSource.findOne({ _id: sourceId, projectId, userId: req.userId });
    if (!source) {
      return res.status(404).json({
        error: { message: 'Knowledge source not found.', code: 'NOT_FOUND' }
      });
    }

    await KnowledgeChunk.deleteMany({ knowledgeSourceId: source._id });
    await KnowledgeSource.deleteOne({ _id: source._id });

    res.status(200).json({ status: 'success', message: 'Knowledge source deleted.' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const searchKnowledgeEndpoint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: { message: 'Query is required.', code: 'BAD_REQUEST' }
      });
    }

    const results = await searchKnowledge(projectId, query, 5);
    res.status(200).json({ results });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const askQuestionEndpoint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await verifyProjectAccess(projectId, req.userId);

    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: { message: 'Query is required.', code: 'BAD_REQUEST' }
      });
    }

    const result = await askQuestion(projectId, query);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  ingestWebsite,
  ingestText,
  getKnowledgeSources,
  getKnowledgeSource,
  deleteKnowledgeSource,
  searchKnowledgeEndpoint,
  askQuestionEndpoint,
};
