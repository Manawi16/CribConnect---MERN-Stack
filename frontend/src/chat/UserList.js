import React, { useState, useEffect, useMemo } from 'react';
import './userlist.css';

const DUMMY_USERS = [
  { _id: 'u1', name: 'Aarav Shah', lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(), profilePic: '', online: true },
  { _id: 'u2', name: 'Meera Iyer', lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), profilePic: '', online: false },
  { _id: 'u3', name: 'Kabir Verma', lastSeen: new Date(Date.now() - 30 * 1000).toISOString(), profilePic: '', online: true },
  { _id: 'u4', name: 'Tanya Gupta', lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), profilePic: '', online: false },
  { _id: 'u5', name: 'Zoya Khan', lastSeen: new Date(Date.now() - 11 * 60 * 1000).toISOString(), profilePic: '', online: false },
];

const formatLastSeen = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Never seen';
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  const a = (parts[0]?.[0] || '').toUpperCase();
  const b = (parts[1]?.[0] || '').toUpperCase();
  return (a + (b || '')).slice(0, 2) || 'U';
};

const UserList = ({ 
  currentUser, 
  selectedPartner, 
  usersOnlineStatus = {}, 
  notifications = [], 
  unreadNotificationCount = 0, 
  showNotificationPanel = false,
  onSelectChat = () => {}, 
  onToggleNotifications = () => {}, 
  makeApiCall 
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const loadUsers = async () => {
    if (!makeApiCall || !currentUser) {
      // No API? Use dummy.
      setUsers(DUMMY_USERS);
      setLoading(false);
      return;
    }
    try {
      const response = await makeApiCall('GET', `/users?excludeId=${currentUser._id}`);
      const apiUsers = (response?.data || []).map(u => ({
        ...u,
        online: usersOnlineStatus[u._id] || false
      }));
      setUsers(apiUsers.length ? apiUsers : DUMMY_USERS);
    } catch (e) {
      console.error('Failed to load user list:', e);
      setUsers(DUMMY_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u => (u.name || '').toLowerCase().includes(term));
  }, [q, users]);

  const handleUserClick = (user) => onSelectChat(user);

  return (
    <div id="user-list-container" className="ulist-container">
      {/* Top bar */}
      <div id="current-user-info" className="ulist-header">
        <div className="me-wrap">
          <div className="me-avatar" aria-hidden="true">
            {getInitials(currentUser?.name)}
          </div>
          <div className="me-meta">
            <h3 id="current-user-name" className="me-name">{currentUser?.name || 'You'}</h3>
            <p className="me-sub">Contacts</p>
          </div>
        </div>

        <div 
          id="notification-bell" 
          className="notif-bell"
          onClick={() => onToggleNotifications(!showNotificationPanel)}
          title="Notifications"
        >
          <span role="img" aria-label="bell">🔔</span>
          {unreadNotificationCount > 0 && (
            <span id="notification-badge" className="notif-badge">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="ulist-search">
        <input 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users"
          className="ulist-input"
        />
      </div>

      {/* List */}
      <ul id="user-list" className="ulist">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="user-item skeleton">
              <div className="avatar-skel" />
              <div className="lines">
                <div className="line l1" />
                <div className="line l2" />
              </div>
            </li>
          ))
        ) : filtered.length === 0 ? (
          <div className="empty">No users found.</div>
        ) : (
          filtered.map(user => {
            const isActive = usersOnlineStatus[user._id] ?? user.online ?? false;
            const statusText = isActive ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`;
            const isSelected = selectedPartner && selectedPartner._id === user._id;

            return (
              <li 
                key={user._id}
                className={`user-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleUserClick(user)}
                data-user-id={user._id}
              >
                {user.profilePic ? (
                  <img className="user-avatar" src={user.profilePic} alt={user.name} />
                ) : (
                  <div className="user-avatar placeholder" aria-hidden="true">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="user-item-details">
                  <div className="user-item-name">
                    {user.name}
                    {isActive && <span className="chip">LIVE</span>}
                  </div>
                  <div className="user-item-status">
                    <span className={`dot ${isActive ? 'online' : 'offline'}`} />
                    <span className="status-text">{statusText}</span>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default UserList;
