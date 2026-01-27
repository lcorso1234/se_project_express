const ClothingItem = require('../models/clothingItem');
const { ForbiddenError, NotFoundError, InternalServerError } = require('../utils/customErrors');

const getClothingItems = async (req, res, next) => {
  try {
    const items = await ClothingItem.find({});
    return res.send(items);
  } catch (err) {
    return next(err);
  }
};

const createClothingItem = async (req, res, next) => {
  try {
    const { name, weather, imageUrl } = req.body;
    const owner = req.user?._id;

    if (!owner) {
      throw new InternalServerError('Owner is not defined for request');
    }

    const newItem = await ClothingItem.create({
      name,
      weather,
      imageUrl,
      owner,
    });

    return res.status(201).send(newItem);
  } catch (err) {
    return next(err);
  }
};

const deleteClothingItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    const item = await ClothingItem.findById(itemId).orFail(() => new NotFoundError('Item not found'));

    if (item.owner.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this item');
    }

    await item.deleteOne();
    return res.send(item);
  } catch (err) {
    return next(err);
  }
};

const likeClothingItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new InternalServerError('User ID is not defined');
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).orFail(() => new NotFoundError('Item not found'));

    return res.send(updatedItem);
  } catch (err) {
    return next(err);
  }
};

const dislikeClothingItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new InternalServerError('User ID is not defined');
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $pull: { likes: userId } },
      { new: true }
    ).orFail(() => new NotFoundError('Item not found'));

    return res.send(updatedItem);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
