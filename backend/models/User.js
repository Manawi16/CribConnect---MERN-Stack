const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true

  },
  name: {
    type: String,
  },
  profile_url: {
    type: String
  },
  role:{
    type:String,
    enum:["tenant","landlord"]
  },
  verified: {
    type: Boolean,
    default: false
  },  
  isPhoneVerified:{
    type:Boolean,
    default:false,
    required:true
  },
  isEmailVerified:{
    type:Boolean,
    default:false,
    required:true
  },
   active: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
}, {
  timestamps: true
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);