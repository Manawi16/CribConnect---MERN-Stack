const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  landlord_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: String,
  description: String,
  place_id: { type: String, required: true },
  formatted_address: { type: String },
  location:{
    lat:Number,
    lng:Number
  },
  address: {
    flat: String,
    area: String,
    city: String,
    state: String,
    pincode: String
  },
    coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    }
  },
 
  bhk: {
    type: Number,
    min: 1,
    default: 1
  },
  price: Number,
  ac: Boolean,
  verified: {
    type: Boolean,
    default: false
  },
  sharing: {
    type: Number,
    min: 1
  },
  mess_included_veg: Boolean,
  mess_included_nonveg: Boolean,
  furnishing: {
    type: String,
    enum: ["none", "semi", "full"]
  },
  bathrooms: {
    type: Number,
    min: 1
  },
  availability_status: {
    type: Boolean,
    default: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ["flat", "room", "pg", "property","null"]
  },
  lease_type: {
    type: String,
    enum: ["bachelor", "family", "professional","null"],
    default:"null"
  },
  wifi: Boolean,
  amenities: {
    lift: Boolean,
    water_purifier: Boolean,
    stove: Boolean,
    inverter: Boolean,
    fridge: Boolean,
    washing_machine: Boolean
  },
  images: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  negotiation: {
    type: Boolean,
    default: false
  },
  gender:{    type: String,
    enum: ["null", "m", "f", "coed"],
    default: "null"} ,
  landlord_requirements: {
    drink: Boolean,
    smoke: Boolean,
    food_type: {
      type: String,
      enum: ["veg", "non-veg","null"],
      default: "null"
    }
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
listingSchema.index({ coordinates: "2dsphere" });


module.exports = mongoose.model("Listing", listingSchema);
