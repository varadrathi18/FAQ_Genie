const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.faqgenie_token;

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Authentication required. No token provided.',
        code: 'AUTH_REQUIRED',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    let message = 'Invalid or expired token.';
    let code = 'INVALID_TOKEN';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Authentication token expired. Please login again.';
      code = 'TOKEN_EXPIRED';
    }
    
    return res.status(401).json({
      error: {
        message,
        code,
      },
    });
  }
};

module.exports = authMiddleware;
