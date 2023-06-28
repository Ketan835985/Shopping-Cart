const router = require('express').Router();
const { userCreate } = require('../controllers/userCtrl')


router.get('/test', (req, res) => {
    res.send('test')
})


// ========================================== user routes ======================================================
router.post('/register', userCreate)

module.exports = router;