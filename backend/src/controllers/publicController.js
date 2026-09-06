const publicationService = require('../services/publicationService');

const getWidgetData = async (req, res, next) => {
  try {
    const { widgetId } = req.params;
    const result = await publicationService.getPublicWidget(widgetId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  getWidgetData
};
