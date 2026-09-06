const express = require('express');
const {
  ingestWebsite,
  getKnowledgeSources,
  getKnowledgeSource,
  deleteKnowledgeSource,
} = require('../controllers/knowledgeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/website', ingestWebsite);
router.get('/', getKnowledgeSources);
router.get('/:sourceId', getKnowledgeSource);
router.delete('/:sourceId', deleteKnowledgeSource);

module.exports = router;
