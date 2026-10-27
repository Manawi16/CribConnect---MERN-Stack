const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'connection_request', 'connection_accepted', 'connection_denied'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedData: {
        conversationId: mongoose.Schema.Types.ObjectId,
        messageId: mongoose.Schema.Types.ObjectId,
        connectionRequestId: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActionable: {
        type: Boolean,
        default: false
    },
    actionRequired: {
        type: String,
        enum: ['accept_connection', 'view_message', 'none'],
        default: 'none'
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
