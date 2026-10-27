const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming a 'users' collection
    required: true,
    index: true
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'property', // assuming a 'properties' collection
    required: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000 // optional: limit comment size
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  image_attachment: {
    type: [String], // URLs to images stored on cloud/CDN
    default: []
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  is_approved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('reviews', reviewSchema);
