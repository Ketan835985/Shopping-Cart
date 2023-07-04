const router = require('express').Router();
const { userCreate, userLogin, updateUser, getUserById } = require('../controllers/userCtrl');
const { auth } = require('../middlewares/auth');
const { createProduct, getProduct, getProductById, updateProduct, deletedProduct } = require('../controllers/productCtrl')


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
module.exports = router;