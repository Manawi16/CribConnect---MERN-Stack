// models/message.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:        { type: String, default: '' },

  // ✅ add 'listing_context' here
  messageType: {
    type: String,
    enum: ['text', 'image', 'contact_postcard', 'system', 'listing_context'],
    default: 'text'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
