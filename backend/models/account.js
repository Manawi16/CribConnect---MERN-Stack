const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true
  },
  user_mobile_no: {
    type: String, // Using String to store numbers with leading 0s or country code
    required: true,
    match: /^[0-9]{10,15}$/, // basic validation (10–15 digits)
    unique: true
  },
  user_email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ // basic email regex
  },
  user_category: {
    type: String,
    enum: ['landlord', 'tenant', 'admin'],
    required: true
  },
  user_password: {
    type: String,
    required: true // make sure to hash this before saving
  },
});

module.exports = mongoose.model('accounts', accountSchema);
