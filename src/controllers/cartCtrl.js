const { isValidObjectId } = require('mongoose');
const cartModel = require('../models/cartModel');
const ObjectIdCheck = require('../utils/proValidation');




const createCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { productId, quantity, totalItems, cartId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ status: false, message: 'Please enter data' });
        }
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Invalid userId' });
        }
        if (!ObjectIdCheck(productId)) {
            return res.status(400).json({ status: false, message: 'Invalid productId' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }
        if (userId.toString !== String(req.userId)) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        if (cartId) {
            if (!ObjectIdCheck(cartId)) {
                return res.status(400).json({ status: false, message: 'Invalid cartId' });
            }
            const cart = await cartModel.findOne({ _id: cartId, isDeleted: false });
            if (!cart) {
                return res.status(404).json({ status: false, message: 'Cart not found' });
            }
            if(String(cart.userId)!== userId.toString()){
                return res.status(401).json({ status: false, message: 'Unauthorized' });
            }
            cart.items.push({
                productId: productId,
                quantity: 1
            })
            cart.totalItems += 1;
            cart.totalPrice += product.price;
            const val = await cart.save();
            const updatedCart = await cartModel.findById(cartId);

            return res.status(200).json({status: true, message: "Product updated", data : updatedCart});
        }
        else {
            const cartDetail = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: 1
                }],
                totalPrice: product.price,
                totalItems: 1
            }
            const cart = await cartModel.create(cartDetail);
            return res.status(201).json({ status: true, message: 'Cart created', data: cart });
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