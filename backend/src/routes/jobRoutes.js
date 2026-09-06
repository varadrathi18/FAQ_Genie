const express = require('express');
const router = express.Router();
const { getJobStatus } = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/:jobId', getJobStatus);

module.exports = router;
