const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  requester_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  connect_status: {
    type: Boolean,
    default: true // false if someone blocks or exits
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_seen: {
    type: Date
  }
});

module.exports = mongoose.model("Conversation", conversationSchema);
