const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config')


const auth = (req, res, next) => {
    try {
        let token = req.headers['x-api-key'] || (req.headers["authorization"])

        if (!token) {
            return res.status(401).json({ status: false, message: 'Invalid token' });
        }
        if((req.headers["authorization"])){
             token = ((req.headers["authorization"]).split(" "))[1]
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.message.includes('jwt') || error.message.includes('invalid signature')) {
            return res.status(401).json({ status: false, message: 'Invalid token' });
        }
        else {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}

module.exports = {
    auth,
}