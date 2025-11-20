const User = require('../models/user');
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');

const SERVER_ERROR_MESSAGE = 'An error has occurred on the server.';

const handleControllerError = (err, res) => {
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
    return res.status(BAD_REQUEST).send({ message: 'Invalid user ID' });
  }

  return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
};

const buildError = (name, message) => {
  const customError = new Error(message);
  customError.name = name;
  return customError;
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).orFail(() =>
      buildError('NotFoundError', 'User not found')
    );
    return res.send(user);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const createUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name || !avatar) {
      throw buildError('ValidationError', 'name and avatar are required');
    }

    const newUser = await User.create({ name, avatar });
    return res.status(201).send(newUser);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
