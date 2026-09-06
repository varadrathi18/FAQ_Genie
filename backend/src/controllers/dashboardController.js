const dashboardService = require('../services/dashboardService');

const getDashboardData = async (req, res, next) => {
  try {
    const result = await dashboardService.getDashboard(req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: { message: error.message, code: error.code } });
    }
    next(error);
  }
};

module.exports = {
  getDashboardData
};
