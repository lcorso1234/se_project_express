const router = require('express').Router();
const { NOT_FOUND } = require('../utils/errors');
const { login, createUser } = require('../controllers/users');
const { getClothingItems } = require('../controllers/clothingItems');
const auth = require('../middlewares/auth');

// Public routes
router.post('/signin', login);
router.post('/signup', createUser);
router.get('/items', getClothingItems);

// Protect the rest
router.use(auth);

// Protected routers
router.use('/users', require('./users'));
router.use('/items', require('./clothingItems'));

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Requested resource not found' });
});

module.exports = router;
