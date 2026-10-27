const express = require('express');
const router = express.Router();
const ConnectionRequestService = require('../services/connectionRequestService');

// POST /api/connection-requests — Create a new request
router.post('/', async (req, res) => {
    try {
        const { fromUser, toUser } = req.body;
        
        if (!fromUser || !toUser) {
            return res.status(400).json({ error: 'fromUser and toUser are required' });
        }

        const connectionRequest = await ConnectionRequestService.createConnectionRequest(fromUser, toUser);

        res.status(201).json({
            success: true,
            message: 'Connection request sent successfully',
            connectionRequest
        });

    } catch (error) {
        console.error('Error in POST /api/connection-requests:', error);
        res.status(500).json({ error: 'Failed to create connection request' });
    }
});

// GET /api/connection-requests/status — Get connection statuses for UI
router.get('/status', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const statuses = await ConnectionRequestService.getConnectionStatuses(userId);

        res.json({
            success: true,
            statuses
        });

    } catch (error) {
        console.error('Error in GET /api/connection-requests/status:', error);
        res.status(500).json({ error: 'Failed to get connection statuses' });
    }
});

// GET /api/connection-requests — Get pending requests for a user
router.get('/', async (req, res) => {
    try {
        const { userId, status = 'pending', type = 'received' } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        let connectionRequests;
        if (type === 'sent') {
            connectionRequests = await ConnectionRequestService.getSentConnectionRequests(userId, status);
        } else {
            connectionRequests = await ConnectionRequestService.getUserConnectionRequests(userId, status);
        }

        res.json({
            success: true,
            connectionRequests,
            count: connectionRequests.length
        });

    } catch (error) {
        console.error('Error in GET /api/connection-requests:', error);
        res.status(500).json({ error: 'Failed to fetch connection requests' });
    }
});

// GET /api/connection-requests/stats — Get connection request statistics
router.get('/stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const stats = await ConnectionRequestService.getConnectionRequestStats(userId);

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error in GET /api/connection-requests/stats:', error);
        res.status(500).json({ error: 'Failed to fetch connection request statistics' });
    }
});

// GET /api/connection-requests/check-connection — Check if two users are connected
router.get('/check-connection', async (req, res) => {
    try {
        const { user1Id, user2Id } = req.query;

        if (!user1Id || !user2Id) {
            return res.status(400).json({ error: 'user1Id and user2Id are required' });
        }

        const areConnected = await ConnectionRequestService.areUsersConnected(user1Id, user2Id);

        res.json({
            success: true,
            areConnected
        });

    } catch (error) {
        console.error('Error in GET /api/connection-requests/check-connection:', error);
        res.status(500).json({ error: 'Failed to check connection status' });
    }
});

// GET /api/connection-requests/:id — Get a specific connection request
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connectionRequest = await ConnectionRequestService.getConnectionRequestById(id);

        if (!connectionRequest) {
            return res.status(404).json({ error: 'Connection request not found' });
        }

        res.json({
            success: true,
            connectionRequest
        });

    } catch (error) {
        console.error('Error in GET /api/connection-requests/:id:', error);
        res.status(500).json({ error: 'Failed to fetch connection request' });
    }
});

// POST /api/connection-requests/:id/respond — Accept/deny a request
router.post('/:id/respond', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, action } = req.body;

        if (!userId || !action) {
            return res.status(400).json({ error: 'userId and action are required' });
        }

        if (!['accept', 'deny'].includes(action)) {
            return res.status(400).json({ error: 'action must be "accept" or "deny"' });
        }

        const connectionRequest = await ConnectionRequestService.respondToConnectionRequest(id, userId, action);

        res.json({
            success: true,
            message: `Connection request ${action}ed successfully`,
            connectionRequest
        });

    } catch (error) {
        console.error('Error in POST /api/connection-requests/:id/respond:', error);
        if (error.message === 'Connection request not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to respond to connection request' });
    }
});

// DELETE /api/connection-requests/:id — Cancel a pending request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await ConnectionRequestService.cancelConnectionRequest(id, userId);

        res.json({
            success: true,
            message: 'Connection request cancelled successfully'
        });

    } catch (error) {
        console.error('Error in DELETE /api/connection-requests/:id:', error);
        if (error.message === 'Connection request not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to cancel connection request' });
    }
});

module.exports = router;