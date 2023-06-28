const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ status: false, message: error.message });
    }
}