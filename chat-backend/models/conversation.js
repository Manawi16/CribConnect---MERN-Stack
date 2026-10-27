// rental-chat-app/models/conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    }
}, { timestamps: true });

// Add a compound unique index to ensure only one conversation exists between two users
// The `set` ensures order doesn't matter (e.g., [A, B] is same as [B, A])
conversationSchema.index({ participants: 1 }, { unique: true, partialFilterExpression: { participants: { $size: 2 } } });


const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;