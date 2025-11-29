const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('./errors');

const SERVER_ERROR_MESSAGE = 'An error has occurred on the server.';

function handleControllerError(err, res, idLabel = 'ID') {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).send({ message: err.message });
  }

  if (err.name === 'NotFoundError' || err.name === 'DocumentNotFoundError') {
    return res.status(NOT_FOUND).send({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).send({ message: `Invalid ${idLabel}` });
  }

  return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
}

module.exports = handleControllerError;
