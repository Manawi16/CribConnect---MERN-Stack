const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const ConnectionRequestService = require('../services/connectionRequestService');

// GET /api/notifications - Get user's notifications
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const { page = 1, limit = 20 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await NotificationService.getUserNotifications(
            userId, 
            parseInt(page), 
            parseInt(limit)
        );

        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread - Get unread notifications
router.get('/unread', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const notifications = await NotificationService.getUnreadNotifications(userId);
        res.json({ notifications, count: notifications.length });
    } catch (error) {
        console.error('Error in GET /api/notifications/unread:', error);
        res.status(500).json({ error: 'Failed to fetch unread notifications' });
    }
});

// POST /api/notifications/:id/read - Mark notification as read
router.post('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const notification = await NotificationService.markAsRead(id, userId);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Error in POST /api/notifications/:id/read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await NotificationService.markAllAsRead(userId);
        res.json({ 
            success: true, 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Error in POST /api/notifications/read-all:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// GET /api/notifications/connection-requests - Get only connection request notifications
router.get('/connection-requests', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const notifications = await NotificationService.getConnectionRequestNotifications(userId);
        res.json({ notifications, count: notifications.length });
    } catch (error) {
        console.error('Error in GET /api/notifications/connection-requests:', error);
        res.status(500).json({ error: 'Failed to fetch connection request notifications' });
    }
});

// POST /api/notifications/:id/respond - Respond to connection request
router.post('/:id/respond', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        if (!action || !['accepted', 'rejected'].includes(action)) {
            return res.status(400).json({ error: 'action must be "accepted" or "rejected"' });
        }

        // Get the notification to find the connection request
        const notification = await NotificationService.getNotificationById(id, userId);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.type !== 'connection_request') {
            return res.status(400).json({ error: 'This notification is not a connection request' });
        }

        // Respond to the connection request
        const connectionRequestAction = action === 'accepted' ? 'accept' : 'deny';
        const updatedRequest = await ConnectionRequestService.respondToConnectionRequest(
            notification.relatedData.connectionRequestId,
            userId,
            connectionRequestAction
        );

        // Mark the notification as read and update it
        await NotificationService.markAsRead(id, userId);

        res.json({ 
            success: true, 
            action,
            connectionRequest: updatedRequest
        });
    } catch (error) {
        console.error('Error in POST /api/notifications/:id/respond:', error);
        res.status(500).json({ error: error.message || 'Failed to respond to connection request' });
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await Notification.deleteOne({ 
            _id: id, 
            recipient: userId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/notifications/:id:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

module.exports = router;


