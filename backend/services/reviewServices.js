// services/reviewService.js

const Review = require('/models/Review');
const mongoose = require('mongoose');

// Create a review
async function createReview({ reviewer_id, listing_id, rating, comment, is_approved }) {
  const review = new Review({
    reviewer_id,
    listing_id,
    rating,
    comment,
    is_approved
  });
  return await review.save();
}

// Calculate average rating
async function calculateRating(listing_id) {
  const result = await Review.aggregate([
    { $match: { listing_id: new mongoose.Types.ObjectId(listing_id), is_approved: true } },
    {
      $group: {
        _id: '$listing_id',
        avg_rating: { $avg: '$rating' },
        total_reviews: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { avg_rating: 0, total_reviews: 0 };
}

// Read all reviews for a listing
async function readReviews(listing_id) {
  return await Review.find({ listing_id, is_approved: true })
    .populate('reviewer_id', 'user_name')
    .sort({ created_date: -1 });
}

// Edit a review
async function editReview(review_id, updateData) {
  updateData.is_edited = true;
  updateData.edited_at = new Date();
  return await Review.findByIdAndUpdate(review_id, updateData, { new: true });
}

// Delete a review
async function deleteReview(review_id) {
  return await Review.findByIdAndDelete(review_id);
}

module.exports = {
  createReview,
  calculateRating,
  readReviews,
  editReview,
  deleteReview
};
