const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

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

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const user = await User.findById(userId).orFail(() =>
      buildError('NotFoundError', 'User not found')
    );
    return res.send(user);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const { name, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, avatar },
      { new: true, runValidators: true }
    ).orFail(() => buildError('NotFoundError', 'User not found'));

    return res.send(updated);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const createUser = async (req, res) => {
  try {
    const { name, avatar, email, password } = req.body;

    if (!name || !avatar || !email || !password) {
      throw buildError('ValidationError', 'name, avatar, email and password are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await User.create({ name, avatar, email, password: hashedPassword });

    const userData = created.toObject();
    delete userData.password;

    return res.status(201).send(userData);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(CONFLICT).send({ message: 'User with this email already exists' });
    }
    return handleControllerError(err, res);
  }
};

// Login controller: POST /login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(BAD_REQUEST).send({ message: 'Email and password are required' });
    }
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.send({ token });
  } catch (err) {
    if (err.statusCode === UNAUTHORIZED) {
      return res.status(UNAUTHORIZED).send({ message: 'Incorrect email or password' });
    }
    return handleControllerError(err, res);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  createUser,
  login,
};
