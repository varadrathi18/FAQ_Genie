const express = require('express');
const router = express.Router({ mergeParams: true });
const { analyzeSeo } = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/analyze', analyzeSeo);

module.exports = router;
