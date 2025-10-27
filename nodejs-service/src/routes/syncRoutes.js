const express = require('express');
const router = express.Router();
const embeddingService = require('../services/embeddingService');
const vectorService = require('../services/vectorService');
const logger = require('../utils/logger');

router.post('/', async (req, res) => {
    try {
        // Handle both single artifact and array
        const artifacts = Array.isArray(req.body) ? req.body : [req.body];
        
        logger.info(`Processing sync request for ${artifacts.length} artifact(s)`);
        
        const results = [];
        
        for (const artifact of artifacts) {
            try {
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

                results.push({ success: true, artifactId: artifact.id });
                logger.info(`Successfully synced artifact: ${artifact.id}`);
            } catch (error) {
                logger.error(`Error syncing artifact ${artifact.id}:`, error);
                results.push({ success: false, artifactId: artifact.id, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const hasFailures = results.some(r => !r.success);
        
        // Return 207 Multi-Status if some succeeded and some failed
        // Return 200 if all succeeded
        // Return 500 if all failed
        let statusCode = 200;
        if (successCount === 0) {
            statusCode = 500;
        } else if (hasFailures) {
            statusCode = 207; // Multi-Status
        }
        
        res.status(statusCode).json({
            success: !hasFailures,
            message: `Synced ${successCount}/${artifacts.length} artifacts`,
            results
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