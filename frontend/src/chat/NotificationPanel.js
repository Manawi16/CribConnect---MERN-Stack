import React from 'react';

const NotificationPanel = ({ 
  notifications, 
  currentUser, 
  onClose, 
  makeApiCall, 
  setNotifications, 
  setUnreadNotificationCount,
  onNotificationClick
}) => {
  const handleMarkAllRead = async () => {
    try {
      await makeApiCall('POST', '/notifications/read-all', { userId: currentUser._id });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Simple function to mark notification as read without navigation
  const handleNotificationClick = async (notification) => {
    try {
      // Don't handle click for connection requests - they have their own buttons
      if (notification.type === 'connection_request') {
        return;
      }

      // Only mark notification as read, no navigation
      if (!notification.isRead) {
        await makeApiCall('POST', `/notifications/${notification._id}/read`, { userId: currentUser._id });
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const handleConnectionResponse = async (notification, action) => {
    try {
      const response = await makeApiCall('POST', `/notifications/${notification._id}/respond`, {
        action: action, // 'accepted' or 'rejected'
        userId: currentUser._id
      });

      if (response.success) {
        // Remove the notification from the list since it's been handled
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        
        // Show success message
        alert(`Connection request ${action}!`);
      }
    } catch (error) {
      console.error(`Failed to ${action} connection request:`, error);
      alert(`Failed to ${action} connection request. Please try again.`);
    }
  };

  return (
    <div id="notification-panel" style={{
      display: 'block',
      position: 'fixed',
      top: '60px',
      right: '20px',
      width: '350px',
      maxHeight: '400px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Mark all read
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close notifications"
          >
            ×
          </button>
        </div>
      </div>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                backgroundColor: !notification.isRead ? '#f8f9fa' : 'transparent',
                cursor: notification.type === 'connection_request' ? 'default' : 'pointer',
                transition: 'background-color 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (notification.type !== 'connection_request') {
                  e.target.style.backgroundColor = !notification.isRead ? '#e3f2fd' : '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (notification.type !== 'connection_request') {
                  e.target.style.backgroundColor = !notification.isRead ? '#f8f9fa' : 'transparent';
                }
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                {notification.title}
                {!notification.isRead && (
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#007bff',
                    borderRadius: '50%',
                    marginLeft: '8px'
                  }}></span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {notification.message}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: notification.type === 'connection_request' ? '8px' : '0' }}>
                {new Date(notification.createdAt).toLocaleString()}
              </div>
              
              {/* Connection request action buttons */}
              {notification.type === 'connection_request' && notification.isActionable && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectionResponse(notification, 'accepted');
                    }}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#218838';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#28a745';
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectionResponse(notification, 'rejected');
                    }}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
