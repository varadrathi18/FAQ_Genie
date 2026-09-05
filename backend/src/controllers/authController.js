const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken, cookieConfig } = require('../utils/auth');

const register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Name must be a non-empty string.',
          code: 'BAD_REQUEST',
        },
      });
    }
    name = name.trim();

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Email must be a non-empty string.',
          code: 'BAD_REQUEST',
        },
      });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        error: {
          message: 'Password must be a string.',
          code: 'BAD_REQUEST',
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 8 characters long.',
          code: 'BAD_REQUEST',
        },
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'Email is already in use.',
          code: 'DUPLICATE_KEY_ERROR',
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    const token = generateToken(newUser._id);
    res.cookie('faqgenie_token', token, cookieConfig);

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Email must be a non-empty string.',
          code: 'BAD_REQUEST',
        },
      });
    }

    if (!password || typeof password !== 'string' || password === '') {
      return res.status(400).json({
        error: {
          message: 'Password must be a non-empty string.',
          code: 'BAD_REQUEST',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const token = generateToken(user._id);
    res.cookie('faqgenie_token', token, cookieConfig);

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('faqgenie_token', {
    ...cookieConfig,
    maxAge: 0,
  });
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User no longer exists.',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
