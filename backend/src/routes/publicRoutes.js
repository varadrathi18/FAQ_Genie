const express = require('express');
const router = express.Router({ mergeParams: true });
const { getWidgetData } = require('../controllers/publicController');

router.get('/widgets/:widgetId', getWidgetData);

module.exports = router;
