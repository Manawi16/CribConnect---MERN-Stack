const ConnectionRequest = require('../models/connectionreq');
const User = require('../models/user');
const NotificationService = require('./notificationService');
const MessageService = require('./messageService');
const ConversationService = require('./conversationService');

// Store Socket.IO instance for real-time updates
let io = null;

// Set Socket.IO instance
function setSocketIO(socketIO) {
    io = socketIO;
}

// Get user socket mapping from server
function getUserSocket(userId) {
    if (!io || !io.userSockets) return null;
    return io.userSockets[userId];
}

class ConnectionRequestService {
    
    static async createConnectionRequest(fromUser, toUser) {
        try {
            // Check if a pending request already exists
            const existingRequest = await ConnectionRequest.findOne({
                $or: [
                    { fromUser, toUser },
                    { fromUser: toUser, toUser: fromUser }
                ],
                status: 'pending' // Only check for pending requests
            });

            if (existingRequest) {
                // Return the existing request instead of throwing an error
                console.log('Connection request already exists, returning existing request');
                await existingRequest.populate('fromUser', 'name profilePicture');
                await existingRequest.populate('toUser', 'name profilePicture');
                return existingRequest;
            }

            // Create the connection request
            const connectionRequest = new ConnectionRequest({
                fromUser,
                toUser,
                status: 'pending'
            });

            await connectionRequest.save();

            // Create notification for the recipient with connection request ID
            await NotificationService.notifyConnectionRequest(fromUser, toUser, connectionRequest._id);

            // Emit real-time Socket.IO event for connection request
            if (io) {
                const toUserSocketId = getUserSocket(toUser);
                if (toUserSocketId) {
                    io.to(toUserSocketId).emit('connectionRequestReceived', {
                        fromUserId: fromUser,
                        toUserId: toUser,
                        connectionRequestId: connectionRequest._id
                    });
                }
            }

            // Populate user details
            await connectionRequest.populate('fromUser', 'name profilePicture');
            await connectionRequest.populate('toUser', 'name profilePicture');

            return connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.createConnectionRequest:', error);
            throw error;
        }
    }

   
    static async getUserConnectionRequests(userId, status = 'pending') {
        try {
            const query = { toUser: userId };
            if (status !== 'all') {
                query.status = status;
            }

            const connectionRequests = await ConnectionRequest.find(query)
                .populate('fromUser', 'name profilePicture email contactNumber')
                .populate('toUser', 'name profilePicture')
                .sort({ createdAt: -1 });

            return connectionRequests;
        } catch (error) {
            console.error('Error in ConnectionRequestService.getUserConnectionRequests:', error);
            throw error;
        }
    }

    
    static async getConnectionStatuses(userId) {
        try {
            const statuses = {};
            
            // Get all connection requests involving this user
            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { fromUser: userId },
                    { toUser: userId }
                ]
            }).populate('fromUser toUser', '_id');

            connectionRequests.forEach(request => {
                const otherUserId = request.fromUser._id.toString() === userId ? 
                    request.toUser._id.toString() : request.fromUser._id.toString();
                
                if (request.status === 'accepted') {
                    statuses[otherUserId] = 'connected';
                } else if (request.status === 'pending') {
                    if (request.fromUser._id.toString() === userId) {
                        statuses[otherUserId] = 'pending_sent';
                    } else {
                        statuses[otherUserId] = 'pending_received';
                    }
                }
            });

            return statuses;
        } catch (error) {
            console.error('Error in ConnectionRequestService.getConnectionStatuses:', error);
            throw error;
        }
    }

    
    static async getSentConnectionRequests(userId, status = 'all') {
        try {
            const query = { fromUser: userId };
            if (status !== 'all') {
                query.status = status;
            }

            const connectionRequests = await ConnectionRequest.find(query)
                .populate('fromUser', 'name profilePicture')
                .populate('toUser', 'name profilePicture email contactNumber')
                .sort({ createdAt: -1 });

            return connectionRequests;
        } catch (error) {
            console.error('Error in ConnectionRequestService.getSentConnectionRequests:', error);
            throw error;
        }
    }

    
    static async respondToConnectionRequest(requestId, userId, action) {
        try {
            if (!['accept', 'deny'].includes(action)) {
                throw new Error('Action must be "accept" or "deny"');
            }

            const connectionRequest = await ConnectionRequest.findOne({
                _id: requestId,
                toUser: userId,
                status: 'pending'
            });

            if (!connectionRequest) {
                throw new Error('Connection request not found');
            }

            // Update the request status
            connectionRequest.status = action === 'accept' ? 'accepted' : 'denied';
            connectionRequest.respondedAt = new Date();
            await connectionRequest.save();

            // Create notification for the requester
            const notificationType = action === 'accept' ? 'connection_accepted' : 'connection_denied';
            const notificationTitle = action === 'accept' 
                ? 'Connection request accepted' 
                : 'Connection request denied';
            const notificationMessage = action === 'accept'
                ? 'Your connection request was accepted'
                : 'Your connection request was denied';

            await NotificationService.createNotification({
                recipient: connectionRequest.fromUser,
                sender: userId,
                type: notificationType,
                title: notificationTitle,
                message: notificationMessage,
                relatedData: {
                    connectionRequestId: connectionRequest._id
                },
                isActionable: false,
                actionRequired: 'none'
            });

            // If connection request is accepted, automatically share contact information
            if (action === 'accept') {
                try {
                    // Get full user details for both users
                    const acceptingUser = await User.findById(userId).select('name email contactNumber');
                    const requestingUser = await User.findById(connectionRequest.fromUser).select('name email contactNumber');
                    
                    if (acceptingUser && requestingUser) {
                        // Get or create conversation between the two users
                        const conversation = await ConversationService.getOrCreateConversation(userId, connectionRequest.fromUser);
                        
                        // Create contact card message from accepting user to requesting user
                        const contactInfo = {
                            name: acceptingUser.name,
                            email: acceptingUser.email,
                            contactNumber: acceptingUser.contactNumber
                        };
                        
                        const contactMessage = await MessageService.createMessage({
                            conversationId: conversation._id,
                            senderId: userId,
                            message: JSON.stringify(contactInfo),
                            messageType: 'contact_postcard'
                        });
                        
                        // Emit real-time Socket.IO events for connection acceptance and contact sharing
                        if (io) {
                            const requestingUserSocketId = getUserSocket(connectionRequest.fromUser.toString());
                            const acceptingUserSocketId = getUserSocket(userId);
                            
                            // Notify both users about connection acceptance
                            const connectionData = {
                                fromUserId: connectionRequest.fromUser.toString(),
                                toUserId: userId,
                                connectionRequestId: connectionRequest._id
                            };
                            
                            if (requestingUserSocketId) {
                                io.to(requestingUserSocketId).emit('connectionAccepted', connectionData);
                            }
                            if (acceptingUserSocketId) {
                                io.to(acceptingUserSocketId).emit('connectionAccepted', connectionData);
                            }
                            
                            // Send contact card message in real-time to requesting user
                            if (requestingUserSocketId && contactMessage) {
                                io.to(requestingUserSocketId).emit('newMessage', {
                                    message: contactMessage,
                                    conversationId: conversation._id
                                });
                            }
                        }
                        
                        console.log('Contact information shared automatically after connection acceptance');
                    }
                } catch (contactSharingError) {
                    console.error('Error sharing contact information after connection acceptance:', contactSharingError);
                    // Don't throw error here - connection acceptance should still succeed even if contact sharing fails
                }
            }

            // Populate user details for response
            await connectionRequest.populate('fromUser', 'name profilePicture');
            await connectionRequest.populate('toUser', 'name profilePicture');

            return connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.respondToConnectionRequest:', error);
            throw error;
        }
    }

    
    static async cancelConnectionRequest(requestId, userId) {
        try {
            const connectionRequest = await ConnectionRequest.findOne({
                _id: requestId,
                fromUser: userId,
                status: 'pending'
            });

            if (!connectionRequest) {
                throw new Error('Connection request not found');
            }

            await ConnectionRequest.deleteOne({ _id: requestId });
            return true;
        } catch (error) {
            console.error('Error in ConnectionRequestService.cancelConnectionRequest:', error);
            throw error;
        }
    }

    
    static async updateConnectionRequestStatus(requestId, isAccepted) {
        try {
            const connectionRequest = await ConnectionRequest.findByIdAndUpdate(
                requestId,
                {
                    status: isAccepted ? 'accepted' : 'denied',
                    respondedAt: new Date()
                },
                { new: true }
            );

            if (!connectionRequest) {
                throw new Error('Connection request not found');
            }

            return connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.updateConnectionRequestStatus:', error);
            throw error;
        }
    }

   
    static async getConnectionRequestById(requestId) {
        try {
            const connectionRequest = await ConnectionRequest.findById(requestId)
                .populate('fromUser', 'name profilePicture email contactNumber')
                .populate('toUser', 'name profilePicture email contactNumber');

            return connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.getConnectionRequestById:', error);
            throw error;
        }
    }


    static async getConnectionRequestBetweenUsers(user1Id, user2Id, status = null) {
        try {
            const query = {
                $or: [
                    { fromUser: user1Id, toUser: user2Id },
                    { fromUser: user2Id, toUser: user1Id }
                ]
            };

            if (status) {
                query.status = status;
            }

            const connectionRequest = await ConnectionRequest.findOne(query);

            return connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.getConnectionRequestBetweenUsers:', error);
            throw error;
        }
    }

    static async getConnectionRequestStats(userId) {
        try {
            const [pendingReceived, pendingSent, acceptedReceived, acceptedSent, deniedReceived, deniedSent] = await Promise.all([
                ConnectionRequest.countDocuments({ toUser: userId, status: 'pending' }),
                ConnectionRequest.countDocuments({ fromUser: userId, status: 'pending' }),
                ConnectionRequest.countDocuments({ toUser: userId, status: 'accepted' }),
                ConnectionRequest.countDocuments({ fromUser: userId, status: 'accepted' }),
                ConnectionRequest.countDocuments({ toUser: userId, status: 'denied' }),
                ConnectionRequest.countDocuments({ fromUser: userId, status: 'denied' })
            ]);

            return {
                pendingReceived,
                pendingSent,
                acceptedReceived,
                acceptedSent,
                deniedReceived,
                deniedSent,
                totalReceived: pendingReceived + acceptedReceived + deniedReceived,
                totalSent: pendingSent + acceptedSent + deniedSent
            };
        } catch (error) {
            console.error('Error in ConnectionRequestService.getConnectionRequestStats:', error);
            throw error;
        }
    }

    static async areUsersConnected(user1Id, user2Id) {
        try {
            const connectionRequest = await ConnectionRequest.findOne({
                $or: [
                    { fromUser: user1Id, toUser: user2Id },
                    { fromUser: user2Id, toUser: user1Id }
                ],
                status: 'accepted'
            });

            return !!connectionRequest;
        } catch (error) {
            console.error('Error in ConnectionRequestService.areUsersConnected:', error);
            return false;
        }
    }

    static async cleanupOldDeniedRequests(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const result = await ConnectionRequest.deleteMany({
                status: 'denied',
                respondedAt: { $lt: cutoffDate }
            });

            return result;
        } catch (error) {
            console.error('Error in ConnectionRequestService.cleanupOldDeniedRequests:', error);
            throw error;
        }
    }
}

module.exports = ConnectionRequestService;
module.exports.setSocketIO = setSocketIO; 