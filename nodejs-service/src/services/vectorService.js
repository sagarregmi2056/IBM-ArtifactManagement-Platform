const { QdrantClient } = require('@qdrant/js-client-rest');
const logger = require('../utils/logger');

class VectorService {
    constructor() {
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });
        
        this.collectionName = 'artifacts';
        this.initialized = false;
    }

    async ensureInitialized() {
        if (this.initialized) {
            return;
        }

        try {
            logger.info(`Connecting to Qdrant at: ${process.env.QDRANT_URL}`);
            
         
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(c => c.name === this.collectionName);

            if (!exists) {
                logger.info('Creating artifacts collection...');
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: 1536,  
                        distance: 'Cosine'
                    }
                });
                logger.info(`✓ Collection '${this.collectionName}' created successfully`);
            } else {
                logger.info(`✓ Collection '${this.collectionName}' already exists`);
            }
            
            this.initialized = true;
            logger.info('Vector service initialized successfully');
        } catch (error) {
            logger.error('Error initializing collection:', error);
            throw new Error('Failed to initialize vector collection: ' + error.message);
        }
    }

    async upsertVector(id, vector, payload) {
        try {
         
            await this.ensureInitialized();
            
            // Convert artifact ID to a valid numeric or UUID format
            const pointId = typeof id === 'number' ? id : parseInt(id, 10);
            
            logger.debug(`Upserting vector for ID: ${pointId}`);
            
            await this.client.upsert(this.collectionName, {
                wait: true,  // Wait for operation to complete
                points: [{
                    id: pointId,  // ← Use numeric ID
                    vector,
                    payload: {
                        ...payload,
                        lastUpdated: new Date().toISOString()
                    }
                }]
            });

            logger.debug('Vector upserted successfully');
        } catch (error) {
            logger.error('Error upserting vector:', error);
            throw new Error('Failed to upsert vector: ' + error.message);
        }
    }

    async searchSimilar(vector, limit = 5) {
        try {
          
            await this.ensureInitialized();
            
            logger.debug(`Searching similar vectors, limit: ${limit}`);
            
            const results = await this.client.search(this.collectionName, {
                vector,
                limit,
                with_payload: true
            });

            logger.debug(`Found ${results.length} similar vectors`);
            return results;
        } catch (error) {
            logger.error('Error searching vectors:', error);
            throw new Error('Failed to search vectors: ' + error.message);
        }
    }

  
    async healthCheck() {
        try {
            await this.client.getCollections();
            return true;
        } catch (error) {
            logger.error('Health check failed:', error);
            return false;
        }
    }
}

module.exports = new VectorService();
