/* eslint-disable max-classes-per-file */
const {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  CONFLICT,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('./errors');

class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message);
    this.statusCode = BAD_REQUEST;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authorization required') {
    super(message);
    this.statusCode = UNAUTHORIZED;
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message);
    this.statusCode = FORBIDDEN;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message);
    this.statusCode = NOT_FOUND;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message);
    this.statusCode = CONFLICT;
  }
}

class InternalServerError extends AppError {
  constructor(message = 'An error has occurred on the server.') {
    super(message);
    this.statusCode = INTERNAL_SERVER_ERROR;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
