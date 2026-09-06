const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const generationRoutes = require('./routes/generationRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/generations', generationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(503).json({
      status: 'error',
      service: 'faqgenie-backend',
      database: 'disconnected'
    });
  }
  
  res.status(200).json({
    status: 'ok',
    service: 'faqgenie-backend',
    database: 'connected'
  });
});

// Handle 404
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
