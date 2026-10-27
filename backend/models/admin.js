const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true // make sure to hash this before saving
  },
  role: {
    type: String,
    enum: ['superadmin', 'moderator', 'reviewer'],
    default: 'moderator'
  },
  last_login_at: {
    type: Date
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

// Middleware: Auto-update updated_at on every save
adminSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('admins', adminSchema);
