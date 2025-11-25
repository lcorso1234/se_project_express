const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    avatar: {
      type: String,
      required: true,
      validate: {
        validator(value) {
          return validator.isURL(value);
        },
        message: 'You must enter a valid URL',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator(value) {
          return validator.isEmail(value);
        },
        message: 'You must enter a valid email',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  { timestamps: true }
);

// Static method for authenticating user by credentials
userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  const User = this;
  const authError = new Error('Incorrect email or password');
  authError.statusCode = 401;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw authError;
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw authError;
  }

  return user; // password still selected here; caller should omit when responding
};

module.exports = mongoose.model('user', userSchema);
