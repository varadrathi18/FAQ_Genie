const jwt = require('jsonwebtoken');

const parseDurationToMs = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') {
    throw new Error('JWT_EXPIRES_IN must be a valid string.');
  }
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format for JWT_EXPIRES_IN: ${durationStr}. Expected format like 1s, 15m, 2h, 7d.`);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // basic support for cross-origin or local
  maxAge: parseDurationToMs(process.env.JWT_EXPIRES_IN), 
};

module.exports = {
  generateToken,
  cookieConfig,
};
