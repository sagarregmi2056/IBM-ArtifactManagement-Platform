require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/utils/logger');
const routes = require('./src/routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'Nodejs-ai  Service is running with vector search capabilities',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`AI Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});