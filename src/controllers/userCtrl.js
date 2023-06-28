const userModel = require('../models/userModel');



const userCreate = async (req, res) => {
    try {
        const {fname, lname, phone, email, password, address, profileImage} = req.body;
        await userModel.create({
            ...req.body
        })
    } catch (error) {
        if (error.message.includes('duplicate')) {
            res.status(400).json({ message: error.message });
        }
        else if (error.message.includes('validation')) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = {
    userCreate,
}