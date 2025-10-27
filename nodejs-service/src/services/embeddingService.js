const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class EmbeddingService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateEmbedding(text) {
        try {
            logger.debug('Generating embedding for text:', text.substring(0, 100) + '...');
            
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text
            });

            logger.debug('Embedding generated successfully');
            return response.data[0].embedding;
        } catch (error) {
            logger.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding: ' + error.message);
        }
    }

    async generateBatchEmbeddings(texts) {
        try {
            logger.info(`Generating embeddings for ${texts.length} texts`);
            
            const embeddings = await Promise.all(
                texts.map(text => this.generateEmbedding(text))
            );

            logger.info('Batch embeddings generated successfully');
            return embeddings;
        } catch (error) {
            logger.error('Error generating batch embeddings:', error);
            throw new Error('Failed to generate batch embeddings: ' + error.message);
        }
    }
}

module.exports = new EmbeddingService();
