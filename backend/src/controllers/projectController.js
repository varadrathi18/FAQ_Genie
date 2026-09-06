const Project = require('../models/Project');
const mongoose = require('mongoose');

// Helper to format project output safely
const formatProject = (project) => ({
  id: project._id,
  title: project.title,
  description: project.description,
  websiteUrl: project.websiteUrl,
  status: project.status,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

// Helper for basic URL validation using standard URL parser
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

const createProject = async (req, res, next) => {
  try {
    let { title, description, websiteUrl } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: { message: 'Title is required and must be a non-empty string.', code: 'BAD_REQUEST' }
      });
    }
    title = title.trim();

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        error: { message: 'Description is required and must be a non-empty string.', code: 'BAD_REQUEST' }
      });
    }
    description = description.trim();

    if (websiteUrl !== undefined) {
      if (typeof websiteUrl !== 'string' || !isValidUrl(websiteUrl)) {
        return res.status(400).json({
          error: { message: 'websiteUrl must be a valid URL.', code: 'BAD_REQUEST' }
        });
      }
      websiteUrl = websiteUrl.trim();
    }

    const project = await Project.create({
      userId: req.userId,
      title,
      description,
      websiteUrl,
    });

    res.status(201).json(formatProject(project));
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.status(200).json({ projects: projects.map(formatProject) });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: { message: 'Invalid project ID format.', code: 'BAD_REQUEST' }
      });
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });

    if (!project) {
      return res.status(404).json({
        error: { message: 'Project not found.', code: 'NOT_FOUND' }
      });
    }

    res.status(200).json(formatProject(project));
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: { message: 'Invalid project ID format.', code: 'BAD_REQUEST' }
      });
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });

    if (!project) {
      return res.status(404).json({
        error: { message: 'Project not found.', code: 'NOT_FOUND' }
      });
    }

    let { title, description, websiteUrl } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          error: { message: 'Title must be a non-empty string.', code: 'BAD_REQUEST' }
        });
      }
      project.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
          error: { message: 'Description must be a non-empty string.', code: 'BAD_REQUEST' }
        });
      }
      project.description = description.trim();
    }

    if (websiteUrl !== undefined) {
      if (typeof websiteUrl !== 'string' || !isValidUrl(websiteUrl)) {
        return res.status(400).json({
          error: { message: 'websiteUrl must be a valid URL.', code: 'BAD_REQUEST' }
        });
      }
      project.websiteUrl = websiteUrl.trim();
    }

    await project.save();
    res.status(200).json(formatProject(project));

  } catch (error) {
    next(error);
  }
};

const archiveProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: { message: 'Invalid project ID format.', code: 'BAD_REQUEST' }
      });
    }

    const project = await Project.findOne({ _id: projectId, userId: req.userId });

    if (!project) {
      return res.status(404).json({
        error: { message: 'Project not found.', code: 'NOT_FOUND' }
      });
    }

    project.status = 'archived';
    await project.save();
    
    res.status(200).json(formatProject(project));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
};
