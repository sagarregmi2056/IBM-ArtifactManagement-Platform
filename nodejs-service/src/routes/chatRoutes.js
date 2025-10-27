const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const logger = require('../utils/logger');

router.post('/query', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        logger.info('Received chat query:', query);
        const response = await chatService.processQuery(query);

        res.json({
            success: true,
            ...response
        });
    } catch (error) {
        logger.error('Error processing chat query:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
