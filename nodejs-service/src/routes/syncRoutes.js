const express = require('express');
const router = express.Router();
const embeddingService = require('../services/embeddingService');
const vectorService = require('../services/vectorService');
const logger = require('../utils/logger');

router.post('/sync', async (req, res) => {
    try {
        const artifact = req.body;
        logger.info(`Processing sync request for artifact ID: ${artifact.id}`);

        // Generate text for embedding
        const text = [
            artifact.name,
            artifact.description,
            artifact.type,
            artifact.version,
            `Created: ${artifact.createdAt}`,
            `Updated: ${artifact.updatedAt}`,
            `Path: ${artifact.filePath}`,
            `Size: ${artifact.sizeBytes}`,
            JSON.stringify(artifact.metadata)
        ].filter(Boolean).join(' ');
        
        // Generate embedding
        const embedding = await embeddingService.generateEmbedding(text);

        // Store in vector database
        await vectorService.upsertVector(artifact.id, embedding, {
            ...artifact,
            timeInfo: {
                created: artifact.createdAt,
                updated: artifact.updatedAt,
                synced: new Date().toISOString()
            },
            stats: {
                size: artifact.sizeBytes,
                hasChecksum: !!artifact.checksum,
                hasMetadata: Object.keys(artifact.metadata || {}).length > 0
            }
        });

        res.json({
            success: true,
            message: 'Artifact synced successfully',
            artifactId: artifact.id
        });
    } catch (error) {
        logger.error('Error in sync endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { text, limit = 5 } = req.body;
        logger.info(`Searching similar artifacts for text: ${text}`);

        const embedding = await embeddingService.generateEmbedding(text);
        const results = await vectorService.searchSimilar(embedding, limit);

        res.json({
            success: true,
            results
        });
    } catch (error) {
        logger.error('Error in search endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;