// src/chat/ChatView.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { chatApi } from './api';
import { connectChatSocket } from './socket';
import { encryptMessage, decryptMessage } from './crypto';
import ChatWindow from './ChatWindow';

export default function ChatView() {
  const { user } = useAuth();
  const { conversationId } = useParams();
console.log("conversationId",conversationId);
  // IMPORTANT: use state (not ref) so ChatWindow re-renders when socket is ready
  const [socket, setSocket] = useState(null);

  const [selectedConversation, setSelectedConversation] = useState(
    conversationId ? { _id: conversationId } : null
  );
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(new Set());
  const [usersOnlineStatus] = useState({}); // keep if you’ll wire presence later
  const [loading, setLoading] = useState(true);

  const makeApiCall = (method, path, data) => chatApi(method, path, data);

  // 1) Connect socket and join the room
  useEffect(() => {
    if (!user) return;

    const s = connectChatSocket();      // should point to http://localhost:5001 with withCredentials
    setSocket(s);

    s.on('connect', () => {
      // Optional legacy event if your server still listens for it
      s.emit('join', user._id);
      if (conversationId) s.emit('joinConversation', conversationId);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user, conversationId]);

  // 2) Fetch conversation + partner and then join room (again, safe)
  useEffect(() => {
    if (!user || !conversationId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        // GET /api/conversations/:id
        console.log('Loaded conversation');
        const res = await chatApi('GET', `/conversations/${conversationId}`);
        console.log('Loaded conversation', res);
        const convo = res.data || res;
        console.log('Loaded conversation', convo);
        if (cancelled) return;

        setSelectedConversation(convo);

        // Find the "other" participant
        // const parts = Array.isArray(convo.participants) ? convo.participants : [];
        // const me = String(user._id);
        // let other = parts.find(p => String(p?._id || p) !== me);

        // // If the backend didn’t populate the user object, fetch it
        // if (other && typeof other === 'string') {
        //   const ures = await chatApi('GET', `/users/${other}`);
        //   other = ures.data || ures;
        // }

        // setSelectedPartner(other || null);        
 const parts = Array.isArray(convo.participants) ? convo.participants : [];
 const meId = String(user._id);

 // Normalize every participant into {_id, name?, email?, avatar?}
 const norm = (p) => {
   if (!p) return null;
   if (typeof p === 'string') return { _id: p };
   // Mongoose ObjectId object?
   if (p._id == null && typeof p === 'object') return { _id: String(p) };
   // Populated user object
   if (p._id) return { _id: String(p._id), name: p.name, email: p.email, avatar: p.avatar };
   return null;
 };

 const normalized = parts.map(norm).filter(Boolean);
 let other = normalized.find(p => p._id !== meId) || null;

 // Try to hydrate if missing name/email and we have an id
 if (other && (!other.name || !other.email)) {
   try {
     // IMPORTANT: include /api if CHAT_API_BASE does not already have it.
     const ures = await chatApi('GET', `/api/users/${other._id}`);
     const u = ures.data || ures;
     if (u && u._id) {
       other = { _id: String(u._id), name: u.name, email: u.email, avatar: u.avatar };
     }
   } catch (e) {
     // Don’t block the UI if the fetch fails; keep a minimal partner
     console.warn('Failed to hydrate partner profile, proceeding with stub:', e?.message || e);
   }
 }

 // Even if hydrate failed, set a stub so UI renders
 setSelectedPartner(other || { _id: 'unknown', name: 'Unknown user' });

        // Room join (harmless to call again)
        if (socket) socket.emit('joinConversation', conversationId);
      } catch (e) {
        console.error('Failed to load conversation:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, conversationId, socket]);

  if (!user) return <div style={{ padding: 12 }}>Please log in.</div>;
  if (loading || !selectedConversation) return <div style={{ padding: 12 }}>Loading chat…</div>;
  if (!selectedPartner) return <div style={{ padding: 12 }}>Loading participant…</div>;

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <ChatWindow
        currentUser={user}
        selectedPartner={selectedPartner}                
        selectedConversation={selectedConversation}
        usersOnlineStatus={usersOnlineStatus}
        connectedUsers={connectedUsers}
        socket={socket}                                
        makeApiCall={makeApiCall}
        encryptMessage={encryptMessage}
        decryptMessage={decryptMessage}
        onImageClick={() => {}}
        setSelectedConversation={setSelectedConversation}
        setConnectedUsers={setConnectedUsers}
      />
    </div>
  );
}
