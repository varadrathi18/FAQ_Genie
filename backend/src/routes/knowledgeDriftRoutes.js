const express = require('express');
const router = express.Router({ mergeParams: true });
const { triggerDriftCalculation, getDriftList, updateDriftStatus } = require('../controllers/knowledgeDriftController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', triggerDriftCalculation);
router.get('/', getDriftList);
router.patch('/:driftId', updateDriftStatus);

module.exports = router;
