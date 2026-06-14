const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gameRoutes = require('./routes/gameRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const jwtRoutes = require('./routes/jwtRoutes');
const adminRoutes = require('./routes/adminRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const middlewareRoutes = require('./routes/middlewareRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const statsRoutes = require('./routes/statsRoutes');

const requestLogger = require('./middlewares/loggerMiddleware');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global custom middlewares
app.use(requestLogger);

// Mount routes
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jwt', jwtRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/protected', protectedRoutes);
app.use('/api/v1/middleware', middlewareRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stats', statsRoutes);

// Basic Health Check API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Steam Games API is running smoothly',
    timestamp: new Date(),
    env: process.env.NODE_ENV
  });
});

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
