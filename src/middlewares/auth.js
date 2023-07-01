const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config')


const auth = (req, res, next) => {
    try {
        const token = req.headers['x-api-key'];
        if(token === undefined) {
            res.status(401).json({ status: false, message: 'Invalid token' });
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if(error.message.includes('jwt') || error.message.includes('invalid signature')) {
            res.status(401).json({ status: false, message: 'Invalid token' });
        }
        else {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}

module.exports = {
    auth,
}