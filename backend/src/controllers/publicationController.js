const mongoose = require('mongoose');
const publicationService = require('../services/publicationService');

const validateIds = (projectId, generationId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(generationId)) {
    throw { status: 400, message: 'Invalid ID format.', code: 'INVALID_ID' };
  }
};

const previewPublication = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    validateIds(projectId, generationId);

    const result = await publicationService.previewPublication(projectId, generationId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const publish = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    validateIds(projectId, generationId);

    const result = await publicationService.publish(projectId, generationId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

const unpublish = async (req, res, next) => {
  try {
    const { projectId, generationId } = req.params;
    validateIds(projectId, generationId);

    const result = await publicationService.unpublish(projectId, generationId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  previewPublication,
  publish,
  unpublish
};
