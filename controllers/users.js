const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { BAD_REQUEST, CONFLICT } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

const buildError = (name, message) => {
  const customError = new Error(message);
  customError.name = name;
  return customError;
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    const user = await User.findById(userId).orFail(() =>
      buildError('NotFoundError', 'User not found')
    );
    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res, next) => {
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
    return next(err);
  }
};

const createUser = async (req, res, next) => {
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
      const conflictErr = new Error('User with this email already exists');
      conflictErr.name = 'ConflictError';
      conflictErr.statusCode = CONFLICT;
      return next(conflictErr);
    }
    return next(err);
  }
};

// Login controller: POST /login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const badReqErr = new Error('Email and password are required');
      badReqErr.name = 'ValidationError';
      badReqErr.statusCode = BAD_REQUEST;
      return next(badReqErr);
    }
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.send({ token });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  createUser,
  login,
};
