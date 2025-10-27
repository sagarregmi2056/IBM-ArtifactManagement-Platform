const { QdrantClient } = require('@qdrant/js-client-rest');
const logger = require('../utils/logger');

class VectorService {
    constructor() {
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });
        
        this.collectionName = 'artifacts';
        this.initializeCollection();
    }

    async initializeCollection() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(c => c.name === this.collectionName);

            if (!exists) {
                logger.info('Creating artifacts collection...');
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: 1536,  // OpenAI ada-002 embedding size
                        distance: 'Cosine'
                    }
                });
                logger.info('Collection created successfully');
            }
        } catch (error) {
            logger.error('Error initializing collection:', error);
            throw new Error('Failed to initialize vector collection: ' + error.message);
        }
    }

    async upsertVector(id, vector, payload) {
        try {
            logger.debug(`Upserting vector for ID: ${id}`);
            
            await this.client.upsert(this.collectionName, {
                points: [{
                    id: id.toString(),
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
}

module.exports = new VectorService();
