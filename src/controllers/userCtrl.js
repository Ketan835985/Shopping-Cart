const userModel = require('../models/userModel');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { uploadFiles } = require('../aws/aws');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config');
const { ObjectIdCheck } = require('../utils/validations');


const userCreate = async (req, res) => {
    try {
        const file = req.files
        const { fname, lname, phone, email, password, address } = req.body;
        if (!fname || !lname || !phone || !email || !password || !address) {
            res.status(400).json({ status: false, message: 'Please enter all fields' });
        }
        if (phone.length != 10) {
            res.status(400).json({ status: false, message: 'Please enter valid phone number' });
        }
        if (validator.isEmail(email)) {
            res.status(400).json({ status: false, message: 'Please enter valid email' });
        }
        if (password.length < 8 || password.length > 15) {
            res.status(400).json({ status: false, message: 'Please enter valid password' });
        }
        if (!address.shipping && !address.billing) {
            res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (!address.shipping.street && !address.billing.street) {
            res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (!address.shipping.city && !address.billing.city) {
            res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (!address.shipping.pincode && !address.billing.pincode) {
            res.status(400).json({ status: false, message: 'Please enter address' });
        }
        if (file.length === 0) {
            res.status(400).json({ status: false, message: 'Please upload profile image' });
        }
        else {
            const phoneCheck = await userModel.findOne({ phone: phone });
            const emailCheck = await userModel.findOne({ email: email });
            if (phoneCheck) {
                res.status(400).json({ status: false, message: 'Phone number already exists' });
            }
            if (emailCheck) {
                res.status(400).json({ status: false, message: 'Email already exists' });
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const url = await uploadFiles(file[0]);
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
            res.status(200).json({ status: true, message: 'User created successfully', data: user });
        }
    } catch (error) {
        if (error.message.includes('duplicate')) {
            res.status(400).json({ status: false, message: error.message });
        }
        else if (error.message.includes('validation')) {
            res.status(400).json({ status: false, message: error.message });
        }
        else {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}


const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ status: false, message: 'Please enter email and password' });
        }
        const user = await userModel.findOne({ email: email });
        if (!user) {
            res.status(400).json({ status: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ status: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '24h' });
        if (token === undefined) {
            res.status(400).json({ status: false, message: 'Invalid token' });
        }
        else {
            res.setHeader('x-api-key', token);
            return res.status(200).json({ status: true, message: 'User logged in successfully', data: { userId: user._id, token: token } });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}



const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ status: false, message: 'Please enter user id' });
        }
        if (!ObjectIdCheck(userId)) {
            res.status(400).json({ status: false, message: 'Please enter valid user id' });
        }
        if (userId.toString() !== String(req.userId)) {
            res.status(403).json({ status: false, message: 'You are Not authenticate' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({ status: true, message: 'User Profile Details', data: user });
    } catch (error) {
        if (error.message.includes('duplicate')) {
            res.status(400).json({ status: false, message: error.message });
        }
        else if (error.message.includes('validation')) {
            res.status(400).json({ status: false, message: error.message });
        }
        else {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}


const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        if (!userId) {
            res.status(400).json({ status: false, message: 'Please enter user id' });
        }
        if (!ObjectIdCheck(userId)) {
            res.status(400).json({ status: false, message: 'Please enter valid user id' });
        }
        if (userId.toString() !== String(req.userId)) {
            res.status(403).json({ status: false, message: 'You are Not authenticate' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ status: false, message: 'User not found' });
        }
        if (data.email) {
            const emailCheck = await userModel.findOne({ email: data.email });
            if (emailCheck) {
                res.status(400).json({ status: false, message: 'Email already exists' });
            }
        }
        if (data.phone) {
            const phoneCheck = await userModel.findOne({ phone: data.phone });
            if (phoneCheck) {
                res.status(400).json({ status: false, message: 'Phone number already exists' });
            }
        }
        if (data.password) {
            if (data.password.length < 8 || data.password.length > 15) {
                res.status(400).json({ status: false, message: 'Please enter valid password' });
            }

        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);
        const url = await uploadFiles(req.files[0]);
        const userDetail = {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            address: {
                shipping: {
                    street: data.address.shipping.street,
                    city: data.address.shipping.city,
                    pincode: data.address.shipping.pincode
                },
                billing: {
                    street: data.address.billing.street,
                    city: data.address.billing.city,
                    pincode: data.address.billing.pincode
                }
            },
            profileImage: url
        }
        await userModel.findByIdAndUpdate(userId, { $set: userDetail }, { new: true });
        res.status(200).json({ status: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    userCreate,
    userLogin,
    getUserById,
    updateUser
}