require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/utils/logger');
const vectorService = require('./src/services/vectorService');


const requiredEnvVars = ['OPENAI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', missingVars);
  logger.error('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('OPENAI') || key.startsWith('QDRANT')));
  process.exit(1);
}


async function initializeServices() {
  try {
    logger.info('Initializing vector database connection...');
    await vectorService.ensureInitialized();
    logger.info('✓ Vector database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize vector database:', error);
    logger.error('Application will exit');
    process.exit(1);
  }
}

const routes = require('./src/routes');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://ibm-artifact-management-platform.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());


app.get('/health', async (req, res) => {
  try {
   
    await vectorService.client.getCollections();
    res.json({ 
      status: 'healthy',
      services: {
        vectorDatabase: 'connected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      services: {
        vectorDatabase: 'disconnected'
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'Nodejs-ai  Service is running with vector search capabilities. Now you can sync your data and search for it. Go to /api/sync to sync your data and /api/search to search for it...........',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);


app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3001;

initializeServices().then(() => {
  app.listen(PORT, () => {
    logger.info(`AI Service running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Vector Database: ${process.env.QDRANT_URL}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});