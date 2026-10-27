const jwt = require('jsonwebtoken');
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'token';

module.exports = function cookieAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload._id || payload.id || payload.userId || payload.sub;
    if (!userId) return res.status(401).json({ error: 'Token missing user id' });

    // Ensure downstream always has req.user._id as a string
    req.user = { ...payload, _id: String(userId) };
    next();
  } catch (e) {
    console.error('cookieAuth verify failed:', e.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
