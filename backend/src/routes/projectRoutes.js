const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:projectId', authMiddleware, getProject);
router.patch('/:projectId', authMiddleware, updateProject);
router.patch('/:projectId/archive', authMiddleware, archiveProject);

module.exports = router;
