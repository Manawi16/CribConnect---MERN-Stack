import { io } from 'socket.io-client';
import { CHAT_SOCKET_URL, CHAT_SOCKET_PATH } from './config';

export function connectChatSocket() {
  const socket = io(CHAT_SOCKET_URL, {
    path: CHAT_SOCKET_PATH,
    transports: ['websocket', 'polling'],
    withCredentials: true, // << send cookie on upgrade
  });

  socket.on('connect', () => console.log('[chat] socket connected', socket.id));
  socket.on('disconnect', () => console.log('[chat] socket disconnected'));
  socket.on('connect_error', (e) => console.error('[chat] connect_error', e?.message || e));
  return socket;
}
