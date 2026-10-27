const Notification = require('../models/notification');
const User = require('../models/user');

class NotificationService {
    // Create a new notification
    static async createNotification(notificationData) {
        try {
            const notification = new Notification(notificationData);
            return await notification.save();
        } catch (error) {
            console.error('Error in NotificationService.createNotification:', error);
            throw error;
        }
    }

    // Get unread notifications for a user
    static async getUnreadNotifications(userId) {
        try {
            return await Notification.find({ 
                recipient: userId, 
                isRead: false 
            })
            .populate('sender', 'name profilePicture')
            .populate('recipient', 'name')
            .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error in NotificationService.getUnreadNotifications:', error);
            throw error;
        }
    }

    // Get all notifications for a user (with pagination)
    static async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const notifications = await Notification.find({ recipient: userId })
                .populate('sender', 'name profilePicture')
                .populate('recipient', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Notification.countDocuments({ recipient: userId });

            return {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalNotifications: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error in NotificationService.getUserNotifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        try {
            return await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { isRead: true },
                { new: true }
            );
        } catch (error) {
            console.error('Error in NotificationService.markAsRead:', error);
            throw error;
        }
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId) {
        try {
            return await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            );
        } catch (error) {
            console.error('Error in NotificationService.markAllAsRead:', error);
            throw error;
        }
    }

    // Delete old notifications (cleanup)
    static async deleteOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            return await Notification.deleteMany({
                createdAt: { $lt: cutoffDate },
                isRead: true
            });
        } catch (error) {
            console.error('Error in NotificationService.deleteOldNotifications:', error);
            throw error;
        }
    }

    // Create notification for new message
    static async notifyNewMessage(senderId, recipientId, conversationId, messageId) {
        try {
            const sender = await User.findById(senderId).select('name');
            const recipient = await User.findById(recipientId).select('name');

            return await this.createNotification({
                recipient: recipientId,
                sender: senderId,
                type: 'message',
                title: `New message from ${sender.name}`,
                message: `${sender.name} sent you a message`,
                relatedData: {
                    conversationId,
                    messageId
                },
                isActionable: true,
                actionRequired: 'view_message'
            });
        } catch (error) {
            console.error('Error in NotificationService.notifyNewMessage:', error);
            throw error;
        }
    }

    // Create notification for connection request
    static async notifyConnectionRequest(fromUserId, toUserId, connectionRequestId = null) {
        try {
            const sender = await User.findById(fromUserId).select('name');
            const recipient = await User.findById(toUserId).select('name');

            const notificationData = {
                recipient: toUserId,
                sender: fromUserId,
                type: 'connection_request',
                title: `Connection request from ${sender.name}`,
                message: `${sender.name} wants to connect with you`,
                isActionable: true,
                actionRequired: 'accept_connection'
            };

            // Add connection request ID to related data if provided
            if (connectionRequestId) {
                notificationData.relatedData = {
                    connectionRequestId
                };
            }

            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error in NotificationService.notifyConnectionRequest:', error);
            throw error;
        }
    }

    // Get only connection request notifications for a user
    static async getConnectionRequestNotifications(userId) {
        try {
            return await Notification.find({ 
                recipient: userId, 
                type: 'connection_request',
                isActionable: true
            })
            .populate('sender', 'name profilePicture')
            .populate('recipient', 'name')
            .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error in NotificationService.getConnectionRequestNotifications:', error);
            throw error;
        }
    }

    // Get a specific notification by ID for a user
    static async getNotificationById(notificationId, userId) {
        try {
            return await Notification.findOne({ 
                _id: notificationId,
                recipient: userId
            })
            .populate('sender', 'name profilePicture')
            .populate('recipient', 'name');
        } catch (error) {
            console.error('Error in NotificationService.getNotificationById:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
