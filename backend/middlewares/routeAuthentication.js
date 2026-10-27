const jwt = require('jsonwebtoken');
const User = require('../models/User');

const routeAuthentication = async (req, res, next) => {
  try {
    const token =  req.cookies.jwtToken;
    if (!token) {
      return res.status(401).redirect("/");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
module.exports = {routeAuthentication};