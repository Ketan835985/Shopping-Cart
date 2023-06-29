const router = require('express').Router();
const { userCreate, userLogin, updateUser, getUserById } = require('../controllers/userCtrl');
const { auth } = require('../middlewares/auth');


router.get('/test', (req, res) => {
    res.send('test')
})


// ========================================== user routes ======================================================
router.post('/register', userCreate)
router.post('/login', userLogin)
router.put('/user/:userId/profile', auth, updateUser)
router.get('/user/:userId/profile', auth, getUserById)


// ========================================= Product routes ======================================================

module.exports = router;