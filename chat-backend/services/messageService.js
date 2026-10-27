// rental-chat-app/services/messageService.js
const Message = require('../models/message');
const ConversationService = require('./conversationService'); // To update lastMessage in conversation

const MessageService = {
    
    createMessage: async (messageData) => {
        console.log('MessageService: createMessage called with data:', messageData);
        try {
            const newMessage = new Message({
                conversationId: messageData.conversationId,
                senderId: messageData.senderId,
                message: messageData.message,
                messageType: messageData.messageType || 'text',
                isDelivered: false, // Default to false, will be updated by socket logic
                isSeen: false       // Default to false, will be updated by socket logic
            });

            console.log('MessageService: Attempting to save new Message instance...');
            const savedMessage = await newMessage.save();
            console.log('MessageService: Message saved to DB successfully:', savedMessage._id);

            // Populate sender details for consistent return format
           await savedMessage.populate('senderId', 'name profilePic');

            // Update the lastMessage field in the corresponding conversation
            await ConversationService.updateLastMessage(savedMessage.conversationId, savedMessage._id);

            return savedMessage;
        } catch (error) {
            console.error('MessageService ERROR: Failed to create/save message to DB:', error);
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);
            if (error.errors) {
                console.error('Validation Errors:', error.errors);
            }
            throw error; // Re-throw to be caught by the calling route/socket handler
        }
    },

    
    getMessagesByConversationId: async (conversationId) => {
        try {
            const messages = await Message.find({ conversationId: conversationId })
                .populate('senderId', 'name profilePic') // Populate sender details
                .sort({ createdAt: 1 }) // Sort by creation time, ascending
                .lean();
            console.log(`Retrieved ${messages.length} messages for conversation ${conversationId}`);
            return messages;
        } catch (error) {
            console.error(`Error in MessageService.getMessagesByConversationId for ${conversationId}:`, error);
            throw error;
        }
    },

    
    markMessagesAsDelivered: async (conversationId, receiverId) => {
        try {
            // First, find the messages that will be marked as delivered
            const messagesToUpdate = await Message.find({
                conversationId: conversationId,
                senderId: { $ne: receiverId }, // Messages not sent by the receiver
                isDelivered: false
            });
            
            if (messagesToUpdate.length === 0) {
                return [];
            }
            
            // Mark all messages in this conversation *not sent by the receiver* and not yet delivered
            const result = await Message.updateMany(
                {
                    conversationId: conversationId,
                    senderId: { $ne: receiverId }, // Messages not sent by the receiver
                    isDelivered: false
                },
                { $set: { isDelivered: true } }
            );
            console.log(`Marked ${result.modifiedCount} messages as delivered for ${receiverId} in conversation ${conversationId}`);
            return messagesToUpdate;
        } catch (error) {
            console.error(`Error marking messages as delivered for conversation ${conversationId}:`, error);
            throw error;
        }
    },

    /**
     * Marks specified messages as seen.
     * @param {string[]} messageIds - An array of message IDs to mark as seen.
     * @param {string} conversationId - The conversation ID (for context/validation).
     * @param {string} userId - The ID of the user who saw the messages (should not be the sender).
     * @returns {Promise<number>} The number of messages updated.
     */
    markMessagesAsSeen: async (messageIds, conversationId, userId) => {
        try {
            console.log(`markMessagesAsSeen called with:`, {
                messageIds,
                conversationId,
                userId
            });
            
            // Convert string IDs to ObjectIds if needed
            const mongoose = require('mongoose');
            const objectIdMessageIds = messageIds.map(id => 
                typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
            );
            
            console.log('Converted message IDs:', objectIdMessageIds);
            
            // First, let's check what messages match our criteria before updating
            const matchingMessages = await Message.find({
                _id: { $in: objectIdMessageIds },
                conversationId: conversationId,
                senderId: { $ne: userId }, // Ensure we're not marking our own sent messages as 'seen by us' in this context
                isSeen: false
            });
            
            console.log(`Found ${matchingMessages.length} messages that match the criteria for marking as seen`);
            console.log('Matching message IDs:', matchingMessages.map(m => m._id));
            console.log('Matching message senders:', matchingMessages.map(m => m.senderId));
            
            if (matchingMessages.length === 0) {
                console.log('No messages match the criteria for marking as seen');
                return 0;
            }
            
            // Update messages that are in the given conversation, are in messageIds list,
            // are not sent by the current user (userId), and are not yet seen.
            const result = await Message.updateMany(
                {
                    _id: { $in: objectIdMessageIds },
                    conversationId: conversationId,
                    senderId: { $ne: userId }, // Ensure we're not marking our own sent messages as 'seen by us' in this context
                    isSeen: false
                },
                { $set: { isSeen: true, isDelivered: true } } // If seen, it's also delivered
            );
            console.log(`Marked ${result.modifiedCount} messages as seen by ${userId} in conversation ${conversationId}`);
            return result.modifiedCount;
        } catch (error) {
            console.error(`Error marking messages as seen for conversation ${conversationId}:`, error);
            throw error;
        }
    }
};

module.exports = MessageService;