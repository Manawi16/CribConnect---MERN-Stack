// rental-chat-app/services/conversationService.js
const Conversation = require('../models/conversation');
const Message = require('../models/message'); // Needed to update lastMessage reference

const ConversationService = {
    
    getOrCreateConversation: async (requesterId, receiverId) => {
        try {
            // Ensure participants are sorted to handle unique indexing correctly
            const participants = [requesterId, receiverId].sort();

            let conversation = await Conversation.findOne({
                participants: { $all: participants, $size: 2 } // Find a conversation with exactly these two participants
            });

            if (conversation) {
                console.log('Existing conversation found:', conversation._id);
                return conversation;
            }

            // If no conversation found, create a new one
            conversation = new Conversation({
                participants: participants
            });
            await conversation.save();
            console.log('New conversation created:', conversation._id);
            return conversation;
        } catch (error) {
            console.error('Error in ConversationService.getOrCreateConversation:', error);
            throw error;
        }
    },

    
    getConversationById: async (conversationId) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                console.warn(`Conversation not found: ${conversationId}`);
            }
            return conversation;
        } catch (error) {
            console.error(`Error in ConversationService.getConversationById for ${conversationId}:`, error);
            throw error;
        }
    },

    
    updateLastMessage: async (conversationId, messageId) => {
        try {
            const conversation = await Conversation.findByIdAndUpdate(
                conversationId,
                { lastMessage: messageId, updatedAt: new Date() }, // Also update updatedAt
                { new: true }
            );
            if (!conversation) {
                console.warn(`Conversation not found for updating last message: ${conversationId}`);
            }
            return conversation;
        } catch (error) {
            console.error(`Error updating last message for conversation ${conversationId}:`, error);
            throw error;
        }
    }
};

module.exports = ConversationService;