// rental-chat-app/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Ensure names are unique for simplicity in this app
    },
    profilePic: {
        type: String,
        default: 'public\—Pngtree—rama avatar - lord shree_19965324.png' // A default placeholder image
    },
    active: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    contactNumber: {
        type: String,
    
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // <-- this ensures emails are saved in lowercase
        trim: true
    }
}, { timestamps: true }); // Mongoose adds createdAt and updatedAt

const User = mongoose.model('User', userSchema);

module.exports = User;