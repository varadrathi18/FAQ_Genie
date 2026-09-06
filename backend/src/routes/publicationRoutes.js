const express = require('express');
const router = express.Router({ mergeParams: true });
const { previewPublication, publish, unpublish } = require('../controllers/publicationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/preview', previewPublication);
router.post('/', publish);
router.delete('/', unpublish);

module.exports = router;
