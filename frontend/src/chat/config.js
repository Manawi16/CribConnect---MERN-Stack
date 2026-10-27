const CHAT_API_BASE   = process.env.REACT_APP_CHAT_API_BASE   || 'http://localhost:5001/api';
const CHAT_SOCKET_URL = process.env.REACT_APP_CHAT_SOCKET_URL || 'http://localhost:5001';
const CHAT_SOCKET_PATH = '/socket.io';
export { CHAT_API_BASE, CHAT_SOCKET_URL, CHAT_SOCKET_PATH };
