// rental-chat-app/services/userService.js
const User = require('../models/user');

const UserService = {
    
    createUser: async (userData) => {
        try {
            // Check if user with this name already exists
            let user = await User.findOne({ name: userData.name });

            if (user) {
                console.log(`User with name '${userData.name}' already exists. Returning existing user.`);
                return user; // Return existing user
            }

            // Create new user
            user = new User(userData);
            await user.save();
            console.log('New user created:', user);
            return user;
        } catch (error) {
            console.error('Error in UserService.createUser:', error);
            throw error;
        }
    },

   
    getAllUsers: async (excludeUserId = null) => {
        try {
            let query = {};
            if (excludeUserId) {
                query._id = { $ne: excludeUserId }; // $ne means "not equal"
            }
            const users = await User.find(query).lean(); // .lean() for plain JS objects
            return users;
        } catch (error) {
            console.error('Error in UserService.getAllUsers:', error);
            throw error;
        }
    },

    
    updateUserStatus: async (userId, isActive) => {
        try {
            const updateData = { active: isActive };
            if (!isActive) { // If going offline, update lastSeen
                updateData.lastSeen = new Date();
            }
            const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
            if (!user) {
                console.warn(`User not found for status update: ${userId}`);
            }
            return user;
        } catch (error) {
            console.error(`Error updating user status for ${userId}:`, error);
            throw error;
        }
    },

    getUserById: async (userId) => {
        try {
            return await User.findById(userId);
        } catch (error) {
            console.error('Error in UserService.getUserById:', error);
            throw error;
        }
    }
};

module.exports = UserService;