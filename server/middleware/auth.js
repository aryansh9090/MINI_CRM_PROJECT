const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const tokenPart = token.split(' ')[1] || token; // Support "Bearer <token>" or just "<token>"
    const decoded = jwt.verify(tokenPart, process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
