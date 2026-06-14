const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
