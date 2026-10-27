const mongoose = require('mongoose');

const cribbyChatbotSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  user_query: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  faq_based: {
    type: Boolean,
    default: false
  },
  blog_suggested: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  },
  timeStamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CribbyChatbot', cribbyChatbotSchema);
