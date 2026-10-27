const mongoose = require('mongoose');

const landlordProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  full_name: {
    type:String,
    required:true
  },
  contact_number: {
    type: String,
    required: false,
    unique: true,
  },
  documents_uploaded: {
    property_tax_receipt: String,
    electricity_bill: String,
  },
  profile_picture: {
    type: String
  },
  listings_posted: {
    type: Number,
    default: 0,
  },
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

module.exports = mongoose.model("LandlordProfile", landlordProfileSchema);
