const mongoose = require('mongoose');
const Project = require('../models/Project');
const KnowledgeSource = require('../models/KnowledgeSource');
const { listDrift, reviewDrift } = require('../services/knowledgeDriftService');
const driftQueue = require('../queues/driftQueue');

const triggerDriftCalculation = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { knowledgeSourceId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(knowledgeSourceId)) {
      throw { status: 400, message: 'Invalid ID format.', code: 'BAD_REQUEST' };
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      throw { status: 404, message: 'Project not found.', code: 'NOT_FOUND' };
    }

    const source = await KnowledgeSource.findOne({ _id: knowledgeSourceId, projectId, userId: req.userId });
    if (!source) {
      throw { status: 404, message: 'Knowledge source not found.', code: 'NOT_FOUND' };
    }

    const versionId = source.currentVersion;
    const jobId = `drift-${knowledgeSourceId}-${versionId}`;
    
    const existingJob = await driftQueue.getJob(jobId);
    if (!existingJob) {
      await driftQueue.add('knowledge.drift', { projectId, knowledgeSourceId, userId: req.userId }, {
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
      knowledgeSourceId
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const getDriftList = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw { status: 400, message: 'Invalid project ID format.', code: 'BAD_REQUEST' };
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      throw { status: 404, message: 'Project not found.', code: 'NOT_FOUND' };
    }

    const drifts = await listDrift(projectId, req.userId);
    res.status(200).json(drifts);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const updateDriftStatus = async (req, res, next) => {
  try {
    const { projectId, driftId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(driftId)) {
      throw { status: 400, message: 'Invalid ID format.', code: 'BAD_REQUEST' };
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      throw { status: 404, message: 'Project not found.', code: 'NOT_FOUND' };
    }

    const drift = await reviewDrift(projectId, driftId, req.userId, status);
    res.status(200).json(drift);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  triggerDriftCalculation,
  getDriftList,
  updateDriftStatus
};
