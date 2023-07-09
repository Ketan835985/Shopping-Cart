const router = require('express').Router();
const { userCreate, userLogin, updateUser, getUserById } = require('../controllers/userCtrl');
const { auth } = require('../middlewares/auth');
const { createProduct, getProduct, getProductById, updateProduct, deletedProduct } = require('../controllers/productCtrl')
const { createCart, getCart, updateCart, cartDelete } = require('../controllers/cartCtrl');
const { createOrder, updateOrder } = require('../controllers/orderCtrl');


router.get('/test', (req, res) => {
    res.send('test')
})


// ========================================== user routes ======================================================
router.post('/register', userCreate)
router.post('/login', userLogin)
router.put('/user/:userId/profile', auth, updateUser)
router.get('/user/:userId/profile', auth, getUserById)


// ========================================= Product routes ======================================================

router.post('/products', createProduct)
router.get('/products', getProduct)
router.get('/products/:productId',getProductById)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deletedProduct)


// ========================================= Cart routes ======================================================
router.post('/users/:userId/cart', auth, createCart)
router.get('/users/:userId/cart', auth, getCart)
router.put('/users/:userId/cart', auth, updateCart)
router.delete('/users/:userId/cart', auth, cartDelete)

// ========================================== Order routes ======================================================
router.post('/users/:userId/orders', auth, createOrder)
router.put('/users/:userId/orders', auth, updateOrder)
router.all("*", function (req, res) {
    res.status(404).send({ status: false, message: "you're on a wrong route" });
  });

module.exports = router;