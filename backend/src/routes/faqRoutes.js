const express = require('express');
const router = express.Router({ mergeParams: true });
const { generateFaqs, saveFaqSelection, suggestFaqs } = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate', generateFaqs);
router.patch('/selection', saveFaqSelection);
router.post('/suggest', suggestFaqs);

module.exports = router;
