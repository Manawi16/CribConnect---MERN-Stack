const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'users'
    required: true,
    index: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  edited_at: {
    type: Date
  },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment', // self-referencing for nested comments
    default: null
  }
});

module.exports = mongoose.model('comments', commentSchema);
