const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
    unique: true,
  },
//   password: {
//     type: String,
//     required: false,
//   },
  google_id: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["tenant", "landlord", "admin"],
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false, // Aadhaar/PAN verification
  },
  is_phone_verified: {
    type: Boolean,
    default: false,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },
  profile_completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);
