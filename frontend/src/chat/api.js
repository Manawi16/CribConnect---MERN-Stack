import { CHAT_API_BASE } from './config';

export async function chatApi(method, path, data) {
  console.log(`[chatApi] ${method} ${path}`, data || '');
  const res = await fetch(`${CHAT_API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // << send cookie
  });

  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body || {};
}
