const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'users', depending on your user collection name
    required: true,
    index: true
  },
  images: {
    type: [String], // URLs of uploaded images
    default: []
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  isRommatePost:{
    type:Boolean,
    sparse:true,
    required:true,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  comment_count: {
    type: Number,
    default: 0
  },
  edited_at: {
    type: Date
  },
  reports_count: {
    type: Number,
    default: 0
  },
  is_approved: {
    type: Boolean,
    default: false // useful if posts require moderation
  }
});

module.exports = mongoose.model('posts', postSchema);
