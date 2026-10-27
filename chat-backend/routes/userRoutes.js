// rental-chat-app/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// POST /api/users - Create a new user (or return existing if name taken)
router.post('/', async (req, res) => {
    try {
        const { name, email, contactNumber } = req.body;
        const user = await userService.createUser({ name, email, contactNumber });
        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
    try {
        // Optionally, exclude the current user if their ID is passed as a query param
        const excludeUserId = req.query.excludeId;
        const users = await userService.getAllUsers(excludeUserId);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

module.exports = router;