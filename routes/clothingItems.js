const router = require('express').Router();
const {
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require('../controllers/clothingItems');
const { validateClothingItem, validateId } = require('../middlewares/validations');

// Public GET /items is defined in routes/index.js before auth.
// Only protected item mutations are defined here.
router.post('/', validateClothingItem, createClothingItem);
router.delete('/:itemId', validateId, deleteClothingItem);
router.put('/:itemId/likes', validateId, likeClothingItem);
router.delete('/:itemId/likes', validateId, dislikeClothingItem);

module.exports = router;
