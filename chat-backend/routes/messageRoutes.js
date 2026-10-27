// rental-chat-app/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');

// GET /api/messages/conversation/:conversationId - Get messages for a specific conversation
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId) {
            return res.status(400).json({ success: false, error: 'Conversation ID is required.' });
        }

        const messages = await messageService.getMessagesByConversationId(conversationId);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error in GET /api/messages/conversation/:conversationId:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

module.exports = router;