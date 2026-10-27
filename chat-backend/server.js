// rental-chat-app/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');


// Import services and routes
const userService = require('./services/userService');
const conversationService = require('./services/conversationService');
const messageService = require('./services/messageService');
const notificationService = require('./services/notificationService');
const connectionRequestService = require('./services/connectionRequestService');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const connectionRequestRoutes = require('./routes/connectionRequestRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000','http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});
// in server.js after creating `io`
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
// Authenticate sockets from HTTP-only cookie (same JWT your Crib FE sets)
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'token';

io.use((socket, next) => {
  try {
    const raw = socket.request.headers.cookie || '';
    const parsed = cookie.parse(raw);
    const token = parsed[COOKIE_NAME];
    if (!token) return next(new Error('unauthorized'));
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(user._id); // now every socket is tied to the logged-in user
    next();
  } catch (e) {
    return next(new Error('unauthorized'));
  }
});


// Initialize Socket.IO for connection request service
connectionRequestService.setSocketIO(io);

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json()); // To parse JSON request bodies

app.use(cookieParser());
// CORS middleware to allow requests from React frontend
app.use((req, res, next) => {
  const ALLOWED = new Set(['http://localhost:3000', 'http://127.0.0.1:3000']); // keep both if you sometimes use 127
  const origin = req.headers.origin;
  if (ALLOWED.has(origin)) res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// Static files are now served by React dev server on port 3001

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Use Date.now() for unique file names
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Serve the Uploads Directory as Static
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/connection-requests', connectionRequestRoutes);

// Add the Upload Endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to the uploaded image
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Store active users and their socket IDs (in-memory, for simplicity)
// In a real-world app, use a persistent store like Redis for scalability
const activeUsers = new Map(); // userId -> socketId

// Socket.IO connection handling
// Store user socket mappings for real-time updates
io.userSockets = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user joins (logs in)
    socket.on('join', async (userId, ack) => {
  socket.userId = String(userId);
  activeUsers.set(socket.userId, socket.id);
  socket.join(socket.userId);

  try {
    await userService.updateUserStatus(socket.userId, true);
    console.log(`User ${socket.userId} status updated to online`);
  } catch (e) {
    console.warn('User not found for status update:', socket.userId);
  }

  if (typeof ack === 'function') ack({ ok: true }); // <-- tell client we're ready
});


    // When a user joins a specific conversation room
    socket.on('joinConversation', async (conversationId) => {
        if (socket.currentConversationId && socket.currentConversationId !== conversationId) {
            // Leave previous conversation room if switching
            socket.leave(socket.currentConversationId);
            console.log(`Socket ${socket.id} left conversation ${socket.currentConversationId}`);
        }
        socket.join(conversationId);
        socket.currentConversationId = conversationId; // Store current conversation for this socket
        console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);

        // Mark messages in this conversation as delivered for the current user (if applicable)
        try {
            const deliveredMessages = await messageService.markMessagesAsDelivered(conversationId, socket.userId);
            if (deliveredMessages && deliveredMessages.length > 0) {
                // Emit to all participants in the conversation that these messages are delivered
                const eventData = {
                    conversationId: conversationId,
                    deliveredBy: socket.userId,
                    messageIds: deliveredMessages.map(msg => msg._id)
                };
                io.to(conversationId).emit('messagesDelivered', eventData);
                console.log(`Successfully marked ${deliveredMessages.length} messages as delivered.`);
                console.log('Emitted messagesDelivered event with data:', eventData);
            }
        } catch (error) {
            console.error(`Error marking messages as delivered for conversation ${conversationId}:`, error);
        }
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
        console.log('--- Received sendMessage event ---');
        console.log('Socket User ID:', socket.userId);
        console.log('Message Data received:', messageData);
        console.log('Socket current room:', socket.currentConversationId);

        if (!socket.userId) {
            console.error(' Attempted to send message without authentication. Socket ID:', socket.id);
            console.error(' Available socket properties:', Object.keys(socket));
            socket.emit('messageError', { error: 'Not authenticated. Please refresh.' });
            return;
        }

        try {
            // Validate message data (optional, but good practice)
            const senderId = socket.userId;
            if (!messageData.conversationId || !senderId || !messageData.message) {
                socket.emit('messageError', { error: 'Missing message fields.' });
                return;
                }

            console.log('Message validation passed, saving to database...');
            // Save the message to the database
            console.log('Attempting to create message via MessageService.createMessage...');
            const convo = await conversationService.getConversationById(messageData.conversationId);
            if (!convo) {
                socket.emit('messageError', { error: 'Conversation not found' });
                return;
            }
            const isMember = (convo.participants || []).some(p => String(p) === String(senderId));
            if (!isMember) {
                socket.emit('messageError', { error: 'Sender not a participant of this conversation' });
                return;
            }

            // Override senderId to prevent null/forged values
            const payload = {
                conversationId: messageData.conversationId,
                senderId,
                messageType: messageData.messageType || 'text',
                message: messageData.message,
            };
            const savedMessage = await messageService.createMessage(payload);
            console.log('MessageService.createMessage successful! Saved Message:', savedMessage);

            // Emit the new message to all clients in the conversation room
            console.log('Emitting message to conversation room:', messageData.conversationId);
            io.to(messageData.conversationId).emit('newMessage', savedMessage);
            console.log(' Message emitted successfully to conversation', messageData.conversationId);
            console.log(' Room info:', io.sockets.adapter.rooms.get(messageData.conversationId));

            // Create notification for the recipient if they're not in the same conversation
            const conversation = await conversationService.getConversationById(messageData.conversationId);
            const receiverId = conversation.participants.find(p => p.toString() !== messageData.senderId);
            
            // Check if receiver is online and in the same conversation
            const receiverSocketId = activeUsers.get(receiverId.toString());
            const receiverSocket = receiverSocketId ? io.sockets.sockets.get(receiverSocketId) : null;
            const isReceiverInSameChat = receiverSocket && receiverSocket.currentConversationId === messageData.conversationId;

            if (!isReceiverInSameChat) {
                // Create notification for offline user or user not in the same chat
                try {
                    await notificationService.notifyNewMessage(
                        messageData.senderId, 
                        receiverId.toString(), 
                        messageData.conversationId, 
                        savedMessage._id
                    );
                    
                    // Emit real-time notification to receiver if online
                    if (receiverSocketId) {
                        const notification = await notificationService.getUnreadNotifications(receiverId.toString());
                        const latestNotification = notification[0]; // Get the most recent one
                        if (latestNotification) {
                            io.to(receiverSocketId).emit('newNotification', latestNotification);
                        }
                    }
                } catch (error) {
                    console.error('Error creating message notification:', error);
                }
            }

            // If the receiver is online and in the same conversation, mark as seen immediately
            if (isReceiverInSameChat) {
                // Receiver is in the same chat, mark as seen
                console.log(`Receiver ${receiverId} is online and in the same chat. Marking as seen.`);
                const updatedCount = await messageService.markMessagesAsSeen([savedMessage._id], messageData.conversationId, receiverId);
                if (updatedCount > 0) {
                    // Emit messagesSeen to the conversation room (consistent with messageSeen handler)
                    const eventData = {
                        messageIds: [savedMessage._id],
                        conversationId: messageData.conversationId,
                        seenBy: receiverId.toString()
                    };
                    io.to(messageData.conversationId).emit('messagesSeen', eventData);
                    console.log('Emitted messagesSeen event (receiver in same chat):', eventData);
                }
            } else if (receiverSocketId) {
                console.log(`Receiver ${receiverId} is online but not in this chat, or socket not found. Marking as delivered.`);
                const deliveredMessages = await messageService.markMessagesAsDelivered(messageData.conversationId, receiverId);
                if (deliveredMessages && deliveredMessages.length > 0) {
                    const eventData = {
                        conversationId: messageData.conversationId,
                        deliveredBy: receiverId,
                        messageIds: deliveredMessages.map(msg => msg._id)
                    };
                    io.to(messageData.conversationId).emit('messagesDelivered', eventData);
                    console.log('Emitted messagesDelivered event (receiver online but not in chat):', eventData);
                }
            } else {
                 console.log(`Receiver ${receiverId} is offline. Message marked as delivered by default.`);
                 const deliveredMessages = await messageService.markMessagesAsDelivered(messageData.conversationId, receiverId);
                 if (deliveredMessages && deliveredMessages.length > 0) {
                     const eventData = {
                         conversationId: messageData.conversationId,
                         deliveredBy: receiverId,
                         messageIds: deliveredMessages.map(msg => msg._id)
                     };
                     io.to(messageData.conversationId).emit('messagesDelivered', eventData);
                     console.log('Emitted messagesDelivered event (receiver offline):', eventData);
                 }
            }

        } catch (error) {
            console.error('CRITICAL ERROR: Failed to save message or emit via socket:', error);
            console.error('Error details:', error.message, error.stack);
            socket.emit('messageError', { conversationId: messageData.conversationId, error: error.message || 'Server error saving message.' });
        }
        console.log('--- End of sendMessage event handler ---');
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        if (socket.userId && data.conversationId) {
            // Emit to all others in the conversation room EXCEPT the sender
            socket.to(data.conversationId).emit('userTyping', {
                userId: socket.userId,
                conversationId: data.conversationId,
                isTyping: data.isTyping
            });
        }
    });

    // Handle message seen status
    socket.on('messageSeen', async (data) => {
        if (!socket.userId || !data.conversationId || !data.messageIds || data.messageIds.length === 0) {
            console.log('messageSeen event rejected - missing required data:', {
                hasUserId: !!socket.userId,
                hasConversationId: !!data.conversationId,
                hasMessageIds: !!data.messageIds,
                messageIdsLength: data.messageIds ? data.messageIds.length : 0
            });
            return;
        }
        try {
            console.log(`User ${socket.userId} marking messages as seen in conversation ${data.conversationId}:`, data.messageIds);
            
            // First, let's check what messages exist in the database
            const existingMessages = await messageService.getMessagesByConversationId(data.conversationId);
            console.log(`Found ${existingMessages.length} total messages in conversation ${data.conversationId}`);
            console.log('Message IDs in conversation:', existingMessages.map(m => m._id));
            console.log('Message IDs to mark as seen:', data.messageIds);
            
            const updatedCount = await messageService.markMessagesAsSeen(data.messageIds, data.conversationId, socket.userId);
            console.log(`markMessagesAsSeen returned updatedCount: ${updatedCount}`);
            
            if (updatedCount > 0) {
                // Emit to all participants in the conversation that these messages are seen
                // This will update the read receipts on both sender's and receiver's side
                const eventData = {
                    messageIds: data.messageIds,
                    conversationId: data.conversationId,
                    seenBy: socket.userId
                };
                console.log('=== EMITTING MESSAGES SEEN EVENT ===');
                console.log('Event data to emit:', eventData);
                console.log('Conversation room:', data.conversationId);
                console.log('Active sockets in room:', io.sockets.adapter.rooms.get(data.conversationId));
                io.to(data.conversationId).emit('messagesSeen', eventData);
                console.log(`Successfully marked ${updatedCount} messages as seen.`);
                console.log('Emitted messagesSeen event with data:', eventData);
            } else {
                console.log('No messages were updated as seen. This might indicate:');
                console.log('1. Messages were already marked as seen');
                console.log('2. Messages were sent by the current user (which shouldn\'t be marked as seen by them)');
                console.log('3. Message IDs don\'t exist in the database');
            }
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    });

    // 1. User A requests contact info from User B
    socket.on('requestContactInfo', async ({ targetUserId, conversationId }) => {
        console.log('--- Received requestContactInfo event ---');
        console.log('Socket User ID:', socket.userId);
        console.log('Target User ID:', targetUserId);
        console.log('Conversation ID:', conversationId);
        
        if (!socket.userId || !targetUserId || !conversationId) {
            console.error('Missing required parameters:', { socketUserId: socket.userId, targetUserId, conversationId });
            socket.emit('messageError', { error: 'Missing required parameters for connection request.' });
            return;
        }
        
        console.log(`[ContactInfo] ${socket.userId} requests contact from ${targetUserId}`);
        console.log(`[ContactInfo] Current activeUsers:`, Object.fromEntries(activeUsers));
        console.log(`[ContactInfo] Active users map:`, Object.fromEntries(activeUsers));
        console.log(`[ContactInfo] Target user ${targetUserId} socket ID:`, activeUsers.get(targetUserId));
        console.log(`[ContactInfo] Is target user online?`, activeUsers.has(targetUserId));
        
        try {
            // Create connection request in database (this also creates the notification)
            console.log('Creating connection request...');
            const connectionRequest = await connectionRequestService.createConnectionRequest(socket.userId, targetUserId);
            console.log('Connection request created successfully:', connectionRequest._id);
            
            const targetSocketId = activeUsers.get(targetUserId);
            if (targetSocketId) {
                console.log(`[ContactInfo] Request sent to socket: ${targetSocketId}`);
                io.to(targetSocketId).emit('contactInfoRequest', {
                    fromUserId: socket.userId,
                    conversationId,
                    connectionRequestId: connectionRequest._id
                });
                
                // Send real-time notification
                console.log('Fetching notifications for real-time update...');
                const notifications = await notificationService.getUnreadNotifications(targetUserId);
                const latestNotification = notifications[0];
                if (latestNotification) {
                    console.log('Sending real-time notification:', latestNotification._id);
                    io.to(targetSocketId).emit('newNotification', latestNotification);
                } else {
                    console.log('No notifications found for real-time update');
                }
            } else {
                console.log(`[ContactInfo] Target user ${targetUserId} is offline or not found in activeUsers.`);
            console.log(`[ContactInfo] Current activeUsers:`, Object.fromEntries(activeUsers));
            console.log(`[ContactInfo] Attempting to send notification anyway...`);
            
            // Try to send notification to all sockets for this user (in case of multiple sessions)
            const allSockets = await io.fetchSockets();
            let notificationSent = false;
            
            for (const socket of allSockets) {
                if (socket.userId === targetUserId) {
                    console.log(`[ContactInfo] Found socket ${socket.id} for user ${targetUserId}`);
                    socket.emit('contactInfoRequest', {
                        fromUserId: socket.userId,
                        conversationId,
                        connectionRequestId: connectionRequest._id
                    });
                    
                    // Send notification
                    const notifications = await notificationService.getUnreadNotifications(targetUserId);
                    const latestNotification = notifications[0];
                    if (latestNotification) {
                        socket.emit('newNotification', latestNotification);
                        console.log(`[ContactInfo] Notification sent to socket ${socket.id}`);
                        notificationSent = true;
                    }
                }
            }
            
            if (!notificationSent) {
                console.log(`[ContactInfo] No active sockets found for user ${targetUserId}. Notification will be delivered when user comes online.`);
            }
            }
            
            console.log('--- Connection request process completed successfully ---');
        } catch (error) {
            console.error('Error creating connection request:', error);
            console.error('Error stack:', error.stack);
            socket.emit('messageError', { error: 'Failed to send connection request: ' + error.message });
        }
    });

    // 2. User B responds to the request
    socket.on('respondContactInfo', async ({ fromUserId, conversationId, allow, connectionRequestId }) => {
        console.log('--- Received respondContactInfo event ---');
        console.log('Socket User ID:', socket.userId);
        console.log('From User ID:', fromUserId);
        console.log('Conversation ID:', conversationId);
        console.log('Allow:', allow);
        console.log('Connection Request ID:', connectionRequestId);
        
        if (!socket.userId || !fromUserId || !conversationId) {
            console.error('Missing required parameters for respondContactInfo');
            return;
        }
        
        try {
            // Update connection request status if we have a valid connectionRequestId
            if (connectionRequestId && connectionRequestId !== 'undefined') {
                const action = allow ? 'accept' : 'deny';
                console.log(`Updating connection request ${connectionRequestId} with action: ${action}`);
                await connectionRequestService.respondToConnectionRequest(connectionRequestId, socket.userId, action);
                console.log('Connection request updated successfully');
            } else {
                console.log('No valid connectionRequestId provided, skipping connection request update');
            }
            
            if (allow) {
                // Fetch both users' contact info
                const [userB, userA] = await Promise.all([
                    userService.getUserById(socket.userId),
                    userService.getUserById(fromUserId)
                ]);
                
                if (userB && userA) {
                    // Send User B's contact info as a postcard
                    const postcardB = {
                        conversationId,
                        senderId: socket.userId,
                        message: JSON.stringify({
                            contactNumber: userB.contactNumber,
                            email: userB.email,
                            name: userB.name
                        }),
                        messageType: 'contact_postcard'
                    };
                    
                    // Send User A's contact info as a postcard
                    const postcardA = {
                        conversationId,
                        senderId: fromUserId,
                        message: JSON.stringify({
                            contactNumber: userA.contactNumber,
                            email: userA.email,
                            name: userA.name
                        }),
                        messageType: 'contact_postcard'
                    };
                    
                    // Save both postcards as messages
                    const [savedMessageB, savedMessageA] = await Promise.all([
                        messageService.createMessage(postcardB),
                        messageService.createMessage(postcardA)
                    ]);
                    
                    // Emit both postcards to the conversation
                    io.to(conversationId).emit('newMessage', savedMessageB);
                    io.to(conversationId).emit('newMessage', savedMessageA);
                    
                    // Emit connection accepted event to disable connect buttons for both users
                    io.to(conversationId).emit('connectionAccepted', {
                        user1Id: socket.userId,
                        user2Id: fromUserId
                    });
                }
            } else {
                // Optionally, notify requester that access was denied
                const fromSocketId = activeUsers.get(fromUserId);
                if (fromSocketId) {
                    io.to(fromSocketId).emit('contactInfoDenied', { conversationId });
                }
            }
            
            // Send real-time notification to requester if online
            const fromSocketId = activeUsers.get(fromUserId);
            if (fromSocketId) {
                const notifications = await notificationService.getUnreadNotifications(fromUserId);
                const latestNotification = notifications[0];
                if (latestNotification) {
                    io.to(fromSocketId).emit('newNotification', latestNotification);
                }
            }
            
        } catch (error) {
            console.error('Error handling contact info response:', error);
            socket.emit('messageError', { error: 'Failed to process response.' });
        }
    });

    // Handle notification read status
    socket.on('markNotificationRead', async ({ notificationId }) => {
        if (!socket.userId || !notificationId) return;
        
        try {
            await notificationService.markAsRead(notificationId, socket.userId);
            // Emit to other clients that this notification was read
            socket.broadcast.emit('notificationRead', { notificationId });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    });

    // Handle mark all notifications as read
    socket.on('markAllNotificationsRead', async () => {
        if (!socket.userId) return;
        
        try {
            await notificationService.markAllAsRead(socket.userId);
            // Emit to other clients that all notifications were read
            socket.broadcast.emit('allNotificationsRead', { userId: socket.userId });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    });

    // On disconnect
    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        
        if (socket.userId) {
            try {
                await userService.updateUserStatus(socket.userId, false);
                console.log(`User ${socket.userId} went offline.`);
                
                // Remove user-socket mapping
                delete io.userSockets[socket.userId];
                 activeUsers.delete(socket.userId); // <- prevent stale socket mapping
                // Broadcast to all connected clients that this user went offline
                socket.broadcast.emit('userOffline', { userId: socket.userId });
            } catch (error) {
                console.error(`Failed to update user ${socket.userId} status on disconnect:`, error);
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
});

// Periodic cleanup of old notifications (run daily)
setInterval(async () => {
    try {
        const deletedCount = await notificationService.deleteOldNotifications(30); // Delete notifications older than 30 days
        console.log(`Cleaned up ${deletedCount.deletedCount || 0} old notifications`);
    } catch (error) {
        console.error('Error during notification cleanup:', error);
    }
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Periodic cleanup of old denied connection requests (run weekly)
setInterval(async () => {
    try {
        const deletedCount = await connectionRequestService.cleanupOldDeniedRequests(30); // Delete denied requests older than 30 days
        console.log(`Cleaned up ${deletedCount.deletedCount || 0} old denied connection requests`);
    } catch (error) {
        console.error('Error during connection request cleanup:', error);
    }
}, 7 * 24 * 60 * 60 * 1000); // Run every 7 days