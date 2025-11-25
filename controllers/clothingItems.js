const ClothingItem = require('../models/clothingItem');
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, FORBIDDEN } = require('../utils/errors');

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
    return res.status(BAD_REQUEST).send({ message: 'Invalid item ID' });
  }

  return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
};

const buildError = (name, message, statusCode) => {
  const customError = new Error(message);
  customError.name = name;
  if (statusCode) {
    customError.statusCode = statusCode;
  }
  return customError;
};

const getClothingItems = async (req, res) => {
  try {
    const items = await ClothingItem.find({});
    return res.send(items);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const createClothingItem = async (req, res) => {
  try {
    const { name, weather, imageUrl } = req.body;
    const owner = req.user?._id;

    if (!name || !weather || !imageUrl) {
      throw buildError('ValidationError', 'name, weather, and imageUrl are required');
    }

    if (!owner) {
      throw buildError('ServerConfigurationError', 'Owner is not defined for request');
    }

    const newItem = await ClothingItem.create({
      name,
      weather,
      imageUrl,
      owner,
    });

    return res.status(201).send(newItem);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const deleteClothingItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    const item = await ClothingItem.findById(itemId).orFail(() =>
      buildError('NotFoundError', 'Item not found')
    );

    if (item.owner.toString() !== userId) {
      throw buildError('ForbiddenError', 'You do not have permission to delete this item', FORBIDDEN);
    }

    await item.deleteOne();
    return res.send(item);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const likeClothingItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw buildError('ServerConfigurationError', 'User ID is not defined');
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).orFail(() => buildError('NotFoundError', 'Item not found'));

    return res.send(updatedItem);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const dislikeClothingItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw buildError('ServerConfigurationError', 'User ID is not defined');
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $pull: { likes: userId } },
      { new: true }
    ).orFail(() => buildError('NotFoundError', 'Item not found'));

    return res.send(updatedItem);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
