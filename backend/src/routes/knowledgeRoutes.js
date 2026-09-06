const express = require('express');
const {
  ingestWebsite,
  getKnowledgeSources,
  getKnowledgeSource,
  deleteKnowledgeSource,
  searchKnowledgeEndpoint,
  askQuestionEndpoint,
} = require('../controllers/knowledgeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/website', ingestWebsite);
router.post('/search', searchKnowledgeEndpoint);
router.post('/ask', askQuestionEndpoint);
router.get('/', getKnowledgeSources);
router.get('/:sourceId', getKnowledgeSource);
router.delete('/:sourceId', deleteKnowledgeSource);

module.exports = router;
