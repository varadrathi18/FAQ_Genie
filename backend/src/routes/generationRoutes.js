const express = require('express');
const {
  createGeneration,
  createNextGeneration,
  getGenerations,
  getGeneration,
  updateGeneration,
} = require('../controllers/generationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', createGeneration);
router.post('/next', createNextGeneration);
router.get('/', getGenerations);
router.get('/:generationId', getGeneration);
router.patch('/:generationId', updateGeneration);

module.exports = router;
