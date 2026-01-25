const { Joi, celebrate } = require('celebrate');
const validator = require('validator');
const { ObjectId } = require('mongoose').Types;

const validateURL = (value, helpers) => {
  if (validator.isURL(String(value), { require_protocol: true })) {
    return value;
  }
  return helpers.error('string.uri');
};

const validateObjectId = (value, helpers) => {
  if (ObjectId.isValid(String(value))) {
    return value;
  }
  return helpers.error('any.invalid');
};

const validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(validateURL),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateClothingItem = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    imageUrl: Joi.string().required().custom(validateURL),
    weather: Joi.string().required().valid('hot', 'warm', 'cold'),
  }),
});

const validateId = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().required().custom(validateObjectId),
  }),
});

module.exports = {
  validateUserBody,
  validateAuthentication,
  validateClothingItem,
  validateId,
};
