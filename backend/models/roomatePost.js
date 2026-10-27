const mongoose = require("mongoose");

const roommatePostSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  location: {
    city: String,
    state: String,
    pincode: String
  },
  price: Number,
  sharing_type: {
    type: Number,
    min: 1
  },
  availability: Number,
  bhk: Number,
  gender: {
    type: String,
    enum: ["male", "female", "any"]
  },
  target_audience: {
    type: String,
    enum: ["student", "professional"]
  },
  images: [String],
  title: String,
  description: String,
  ac: Boolean,
  wifi: Boolean,
  is_approved: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("RoommatePost", roommatePostSchema);
