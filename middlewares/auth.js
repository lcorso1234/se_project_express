const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const authErr = new Error('Authorization required');
    authErr.name = 'UnauthorizedError';
    authErr.statusCode = UNAUTHORIZED;
    return next(authErr);
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    // Forward JWT errors (JsonWebTokenError, TokenExpiredError) to centralized handler
    return next(err);
  }
};
