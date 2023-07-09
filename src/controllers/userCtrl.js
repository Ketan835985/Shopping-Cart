const userModel = require('../models/userModel');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { uploadFiles } = require('../aws/aws');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config');
const { ObjectIdCheck } = require('../utils/validations');


const userCreate = async (req, res) => {
    try {
        const files = req.files
        const { fname, lname, phone, email, password, address, profileImage } = req.body;
        // console.log(req.body)
        if (!fname || !lname || !phone || !email || !password) {
            return res.status(400).json({ status: false, message: 'Please enter all fields' });
        }
        if (/^[6789]\d{9}$/.test(phone)==false) {
            return res.status(400).json({ status: false, message: 'Please enter valid phone number' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ status: false, message: 'Please enter valid email' });
        }
        if (password.length <= 8 || password.length >= 15) {
            return res.status(400).json({ status: false, message: 'Please enter valid password' });
        }
        if (!address.shipping.street || !address.billing.street) {
            return res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (!address.shipping.city || !address.billing.city) {
            return res.status(400).json({ status: false, message: 'Please enter address' });
        }

        if (!address.shipping.pincode || !address.billing.pincode) {
            return res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (files.length === 0) {
            return res.status(400).json({ status: false, message: 'Please upload profile image' });
        }
        else {
            const phoneCheck = await userModel.findOne({ $or: [{ phone }, { email }] });
            const url = await uploadFiles(files[0]);
            if (phoneCheck) {
                return res.status(400).json({ status: false, message: 'Phone number or email already exists' });
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const userDetail = {
                fname: fname,
                lname: lname,
                phone: phone,
                email: email,
                password: hashedPassword,
                address: {
                    shipping: {
                        street: address.shipping.street,
                        city: address.shipping.city,
                        pincode: address.shipping.pincode
                    },
                    billing: {
                        street: address.billing.street,
                        city: address.billing.city,
                        pincode: address.billing.pincode
                    }
                },
                profileImage: url
            }

            const user = await userModel.create(userDetail);
            return res.status(201).json({ status: true, message: 'User created successfully', data: user });
        }
    } catch (error) {
        if (error.message.includes('duplicate')) {
            return res.status(400).json({ status: false, message: error.message });
        }
        else if (error.message.includes('validation')) {
            return res.status(400).json({ status: false, message: error.message });
        }
        else {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}


const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Please enter email and password' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: 'Invalid password' });
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '24h' });
        res.setHeader('x-api-key', token);
        return res.status(200).json({ status: true, message: 'User logged in successfully', data: { userId: user._id, token: token } });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Please enter valid user id' });
        }
        if (userId.toString() !== String(req.userId)) {
            return res.status(403).json({ status: false, message: 'You are Not authenticate' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        return res.status(200).json({ status: true, message: 'User Profile Details', data: user });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}


const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        let data = req.body;
        if ((Object.keys(data)).length===0) {
            return res.status(400).json({ status: false, message: 'Please enter data' });
        }
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Please enter valid user id' });
        }
        if (userId.toString() !== String(req.userId)) {
            return res.status(403).json({ status: false, message: 'You are Not authenticate' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        if (data.email) {
            if (!validator.isEmail(data.email)) {
                return res.status(400).json({ status: false, message: 'Please enter valid email' })
            }
            const emailCheck = await userModel.findOne({ email: data.email });
            if (emailCheck) {
                return res.status(400).json({ status: false, message: 'Email already exists' });
            }
        }
        if (data.phone) {
            
            const phoneCheck = await userModel.findOne({ phone: data.phone });
            if (/^[6789]\d{9}$/.test(data.phone)==false) {
                return res.status(400).json({ status: false, message: 'Please enter valid phone number' })
            }
            if (phoneCheck) {
                return res.status(400).json({ status: false, message: 'Phone number already exists' });
            }
        }
        if (data.password) {
            if (data.password.length <= 8 || data.password.length >= 15) {
                return res.status(400).json({ status: false, message: 'Please enter valid password' });
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(data.password, salt);
            data.password = hashedPassword
        }
        let updateUser2 = await userModel.findByIdAndUpdate(userId, { $set: data }, { new: true });
        return res.status(200).json({ status: true, message: 'User updated successfully', data: updateUser2 });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    userCreate,
    userLogin,
    getUserById,
    updateUser
}