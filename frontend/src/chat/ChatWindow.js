import React, { useState, useEffect, useRef, useCallback } from 'react';
import './chat.css';

const ChatWindow = ({ 
  currentUser, 
  selectedPartner, 
  selectedConversation, 
  usersOnlineStatus, 
  connectedUsers,
  socket, 
  makeApiCall, 
  encryptMessage, 
  decryptMessage, 
  onImageClick,
  setSelectedConversation,
  setConnectedUsers
}) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getPartnerStatus = () => {
    if (!selectedPartner) return '';
    if (partnerTyping) return 'Typing…';
    const isOnline = usersOnlineStatus?.[selectedPartner._id];
    return isOnline ? 'Online' : 'Offline';
  };

  const isConnected = () => {
    if (!selectedPartner || !currentUser) return false;
    const connectionKey = [currentUser._id, selectedPartner._id].sort().join('-');
    return connectedUsers?.has?.(connectionKey);
  };

  const handleConnect = () => {
    if (!selectedPartner || !selectedConversation || !socket) {
      console.error('Missing required data for connection request:', {
        selectedPartner: !!selectedPartner,
        selectedConversation: !!selectedConversation,
        socket: !!socket
      });
      alert('Unable to send connection request. Please try again.');
      return;
    }
    
    if (!socket.connected) {
      console.error('❌ Socket is not connected!');
      alert('Connection lost. Please refresh the page and try again.');
      return;
    }
    
    socket.emit('requestContactInfo', {
      targetUserId: selectedPartner._id,
      conversationId: selectedConversation._id
    });
    alert(`Connection request sent to ${selectedPartner.name}!`);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation._id,
        isTyping: true
      });
    }
  };

  const handleInputBlur = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation._id,
        isTyping: false
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (!selectedConversation) {
      alert('Please select a conversation first');
      return;
    }
    if (!socket) {
      alert('Connection lost. Please refresh the page.');
      return;
    }

    socket.emit('sendMessage', {
      conversationId: selectedConversation._id,
      senderId: currentUser._id,
      message: encryptMessage(messageInput.trim()),
      messageType: 'text'
    });
    setMessageInput('');
    if (socket && selectedConversation) {
      socket.emit('typing', { conversationId: selectedConversation._id, isTyping: false });
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedConversation || !socket) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      if (data.imageUrl) {
        socket.emit('sendMessage', {
          conversationId: selectedConversation._id,
          senderId: currentUser._id,
          message: encryptMessage(data.imageUrl),
          messageType: 'image'
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert(`Image upload failed: ${error.message}`);
    }
    e.target.value = '';
  };

  const markMessagesAsSeen = useCallback((messagesToMark) => {
    if (!socket || !selectedConversation || !currentUser || messagesToMark.length === 0) return;
    const unseenMessages = messagesToMark.filter(msg => 
      msg?.senderId?._id !== currentUser._id && !msg.isSeen
    );
    if (unseenMessages.length > 0) {
      const messageIds = unseenMessages.map(msg => msg._id).filter(Boolean);
      socket.emit('messageSeen', { conversationId: selectedConversation._id, messageIds });
    }
  }, [socket, selectedConversation, currentUser]);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => markMessagesAsSeen(messages), 400);
      return () => clearTimeout(timer);
    }
  }, [messages, markMessagesAsSeen]);

  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const timer = setTimeout(() => markMessagesAsSeen(messages), 400);
      return () => clearTimeout(timer);
    }
  }, [selectedConversation, markMessagesAsSeen]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedPartner || !currentUser) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      try {
        const convoResponse = await makeApiCall('POST', '/conversations', {
          requesterId: currentUser._id,
          receiverId: selectedPartner._id
        });
        setSelectedConversation(convoResponse.data);
        if (socket) socket.emit('joinConversation', convoResponse.data._id);

        const messagesResponse = await makeApiCall('GET', `/messages/conversation/${convoResponse.data._id}`);
        const decryptedMessages = messagesResponse.data.map(msg => ({
          ...msg,
          message: decryptMessage(msg.message)
        }));
        setMessages(decryptedMessages);
        setTimeout(scrollToBottom, 80);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };

    loadConversation();
  }, [selectedPartner, currentUser, socket, makeApiCall, decryptMessage, setSelectedConversation]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        const decryptedMessage = { ...message, message: decryptMessage(message.message) };
        setMessages(prev => [...prev, decryptedMessage]);
        setTimeout(scrollToBottom, 60);
      }
    };

    const handleTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id && data.userId !== currentUser._id) {
        setPartnerTyping(data.isTyping);
      }
    };

    const handleMessagesDelivered = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg._id) ? { ...msg, isDelivered: true } : msg
        ));
      }
    };

    const handleMessagesSeen = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg._id) ? { ...msg, isSeen: true, isDelivered: true } : msg
        ));
      }
    };

    const handleConnectionAccepted = (data) => {
      const { user1Id, user2Id } = data;
      const connectionKey = [user1Id, user2Id].sort().join('-');
      setConnectedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(connectionKey);
        return newSet;
      });
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('messagesDelivered', handleMessagesDelivered);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('connectionAccepted', handleConnectionAccepted);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('messagesDelivered', handleMessagesDelivered);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('connectionAccepted', handleConnectionAccepted);
    };
  }, [socket, selectedConversation, currentUser, decryptMessage, setConnectedUsers]);

  const getMessageStatusIcon = (message) => {
    const isSent = message?.senderId?._id === currentUser._id;
    if (!isSent) return null;
    if (message.isSeen)   return <span className="tick tick-seen" title="Seen">✓✓</span>;
    if (message.isDelivered) return <span className="tick tick-delivered" title="Delivered">✓✓</span>;
    return <span className="tick tick-sent" title="Sent">✓</span>;
  };

  if (!selectedPartner) {
    return (
      <div id="chat-window" className="chat-window">
        <div className="chat-placeholder">Select a user to start chatting.</div>
      </div>
    );
  }

  return (
    <div id="chat-window" className="chat-window">
      {/* Header */}
      <div id="chat-header" className="chat-header">
        <div className="header-left">
          <img 
            className="avatar"
            src="/—Pngtree—rama avatar - lord shree_19965324.png"
            alt="Partner"
          />
          <div className="user-meta">
            <h2 className="user-name">{selectedPartner.name}</h2>
            <p className={`user-status ${getPartnerStatus() === 'Online' ? 'online' : 'offline'}`}>
              {getPartnerStatus()}
            </p>
          </div>
        </div>
        <div className="header-right">
          {!isConnected() ? (
            <button className="btn btn-connect" onClick={handleConnect}>Connect</button>
          ) : (
            <button className="btn btn-connected" disabled>Connected</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div id="messages-container" ref={messagesContainerRef} className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet. Say hi!</div>
        ) : (
          messages.map((msg, index) => {
            const isSent = msg?.senderId?._id === currentUser._id;
            return (
              <div key={msg._id || index} className={`bubble-row ${isSent ? 'align-right' : 'align-left'}`}>
                {!isSent && (
                  <div className="mini-avatar" title={msg?.senderId?.name || 'User'}>
                    {(msg?.senderId?.name || 'U').slice(0,1).toUpperCase()}
                  </div>
                )}
                <div className={`bubble ${isSent ? 'bubble-sent' : 'bubble-received'}`}>
                  <div className="bubble-body">
                    {msg.messageType === 'image' ? (
                      <img
                        src={msg.message}
                        className="chat-image"
                        onClick={() => onImageClick?.(msg.message)}
                        alt="Shared"
                        loading="lazy"
                      />
                    ) : msg.messageType === 'contact_postcard' ? (
                      <div className="card-contact">
                        <div className="card-title">Contact Card</div>
                        {(() => {
                          try {
                            const c = JSON.parse(msg.message);
                            return (
                              <div className="card-grid">
                                <div><strong>Name:</strong> {c.name}</div>
                                <div><strong>Email:</strong> {c.email}</div>
                                <div><strong>Phone:</strong> {c.contactNumber}</div>
                              </div>
                            );
                          } catch {
                            return <div>Invalid contact information</div>;
                          }
                        })()}
                      </div>
                    ) : msg.messageType === 'listing_context' ? (
                      <div className="card-listing">
                        {(() => {
                          try {
                            const ctx = JSON.parse(msg.message);
                            const price = ctx.price ? `₹${ctx.price}` : '';
                            return (
                              <>
                                {ctx.thumbnailUrl && (
                                  <img
                                    src={ctx.thumbnailUrl}
                                    alt={ctx.title || 'Listing'}
                                    className="listing-thumb"
                                    loading="lazy"
                                  />
                                )}
                                <div className="listing-info">
                                  <div className="listing-title">{ctx.title || 'Listing'}</div>
                                  {price && <div className="listing-price">{price}</div>}
                                  <a href={ctx.url || '#'} className="listing-link" target="_blank" rel="noreferrer">
                                    View listing
                                  </a>
                                </div>
                              </>
                            );
                          } catch {
                            return <div>Listing info unavailable</div>;
                          }
                        })()}
                      </div>
                    ) : (
                      <span>{msg.message}</span>
                    )}
                  </div>
                  <div className="bubble-meta">
                    <span className="time">{formatMessageTime(msg.createdAt)}</span>
                    {getMessageStatusIcon(msg)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {partnerTyping && (
          <div className="typing-row">
            <div className="typing-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div id="message-input-container" className="composer">
        <form id="chat-form" onSubmit={handleSubmit} className="composer-form">
          <button type="button" className="icon-btn" onClick={handleImageClick} title="Send image">📷</button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input 
            type="text" 
            id="message-input" 
            className="composer-input"
            value={messageInput}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Type a message…" 
            disabled={!selectedConversation}
          />
          <button type="submit" className="btn btn-send" disabled={!selectedConversation}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
