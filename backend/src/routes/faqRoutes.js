const express = require('express');
const router = express.Router({ mergeParams: true });
const { generateFaqs } = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate', generateFaqs);

module.exports = router;
