const ClothingItem = require('../models/clothingItem');
const { FORBIDDEN } = require('../utils/errors');

const handleControllerError = require('../utils/handleControllerError');

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
    return handleControllerError(err, res, 'item ID');
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
    return handleControllerError(err, res, 'item ID');
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
      throw buildError(
        'ForbiddenError',
        'You do not have permission to delete this item',
        FORBIDDEN
      );
    }

    await item.deleteOne();
    return res.send(item);
  } catch (err) {
    return handleControllerError(err, res, 'item ID');
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
    return handleControllerError(err, res, 'item ID');
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
    return handleControllerError(err, res, 'item ID');
  }
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
