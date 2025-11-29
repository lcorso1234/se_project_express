const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { BAD_REQUEST, CONFLICT, UNAUTHORIZED } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');

const handleControllerError = require('../utils/handleControllerError');

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
    return handleControllerError(err, res, 'user ID');
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
    return handleControllerError(err, res, 'user ID');
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
    return handleControllerError(err, res, 'user ID');
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
    return handleControllerError(err, res, 'user ID');
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  createUser,
  login,
};
