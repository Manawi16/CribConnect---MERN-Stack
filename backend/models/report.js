const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts', // or 'users'
    required: true
  },
  reported_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reported_entity: {
    type: String,
    enum: ['landlord', 'tenant', 'property', 'post', 'conversation'],
    required: true
  },
  report_type: {
    type: String,
    enum: ['spam', 'bad_words', 'fraud', 'didn’t_like', 'other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  review_status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  admin_notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('reports', reportSchema);
