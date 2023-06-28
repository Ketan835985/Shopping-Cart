const router = require('express').Router();
const { userCreate, userLogin } = require('../controllers/userCtrl')


router.get('/test', (req, res) => {
    res.send('test')
})


// ========================================== user routes ======================================================
router.post('/register', userCreate)
router.post('/login', userLogin)

module.exports = router;