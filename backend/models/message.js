const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type_of_message: {
    type: String,
    enum: ["text", "image", "document"],
    default: "text"
  },
  message: {
    type: String
  },
  is_seen: {
    type: Boolean,
    default: false
  },
  sent_time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
