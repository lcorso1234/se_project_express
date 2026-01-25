const {
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('../utils/errors');

const SERVER_ERROR_MESSAGE = 'An error has occurred on the server.';

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // Prefer explicit statusCode on error
  const { statusCode, message: originalMessage } = err;
  let status = statusCode;
  let message = originalMessage;

  // Map common error names if statusCode not set
  if (!status) {
    switch (err.name) {
      case 'ValidationError':
        status = BAD_REQUEST;
        break;
      case 'NotFoundError':
      case 'DocumentNotFoundError':
        status = NOT_FOUND;
        break;
      case 'CastError':
        status = BAD_REQUEST;
        break;
      case 'JsonWebTokenError':
      case 'TokenExpiredError':
        status = UNAUTHORIZED;
        message = 'Authorization required';
        break;
      default:
        status = INTERNAL_SERVER_ERROR;
        break;
    }
  }

  // Provide clearer messages for some cases when not explicitly set
  if (!err.statusCode) {
    if (err.name === 'CastError') {
      const { itemId, userId } = req.params || {};
      if (itemId) {
        message = 'Invalid item ID';
      } else if (userId) {
        message = 'Invalid user ID';
      } else {
        message = 'Invalid ID';
      }
    }

    if (status === INTERNAL_SERVER_ERROR) {
      message = SERVER_ERROR_MESSAGE;
    }
  }

  return res.status(status).send({ message });
};
