const mongoose = require("mongoose");

const tenantProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  age_range: {
    type: String,
    enum: ["18-24", "25-34", "35-44", "45+"]
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },
  occupation_status: {
    type: String,
    enum: ["student", "working", "professional", "business"]
  },
  eating_habits: {
    type: String,
    enum: ["veg", "non-veg"]
  },
  smoke: Boolean,
  drink: Boolean,
  profile_picture: {
    type: String
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String
    }
  },
  liked_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    }
  ],
  my_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    }
  ],
  last_seen: {
    type: Date
  },
  blocked_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Tenant", tenantProfileSchema);
