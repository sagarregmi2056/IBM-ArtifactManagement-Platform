require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/utils/logger');

// Check required environment variables at startup
const requiredEnvVars = ['OPENAI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', missingVars);
  logger.error('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('OPENAI') || key.startsWith('QDRANT')));
  process.exit(1);
}

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
    status: 'Nodejs-ai  Service is running with vector search capabilities. Now you can sync your data and search for it. Go to /api/sync to sync your data and /api/search to search for it........',
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