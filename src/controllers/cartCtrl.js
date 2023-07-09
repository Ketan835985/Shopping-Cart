
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const { ObjectIdCheck } = require('../utils/validations');




const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productId, quantity, totalItems, cartId } = req.body;
        if ( !productId) {
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
        if (userId.toString() !== String(req.userId)) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }
        const cartByUser = await cartModel.findOne({ userId: userId })
        if (cartId || cartByUser) {
            if (cartId) {
                if (!ObjectIdCheck(cartId)) {
                    return res.status(400).json({ status: false, message: 'Invalid cartId' });
                }
                const cart = await cartModel.findOne({ _id: cartId, });
                if (!cart) {
                    return res.status(404).json({ status: false, message: 'Cart not found' });
                }
                if (String(cart.userId) !== (req.userId).toString()) {
                    return res.status(403).json({ status: false, message: 'Unauthorized' });
                }
                if (cart.items.length > 0) {
                    let checkPro = (cart.items).find(x => (x.productId).toString() === (productId).toString());
                    if (!checkPro) {
                        cart.items.push({
                            productId: productId,
                            quantity: 1
                        })
                        cart.totalItems += 1;
                        cart.totalPrice += product.price;
                        const val = await cart.save();
                        return res.status(200).json({ status: true, message: "Product updated", data: val });
                    }
                    else {
                        const cartProduct = (cart.items).find(x => (x.productId).toString() === (productId).toString());
                        cartProduct.quantity += 1;
                        cart.totalPrice += product.price;
                        const val = await cart.save();
                        return res.status(200).json({ status: true, message: "Product updated", data: val });
                    }
                }
                else {
                    cart.items.push({
                        productId: productId,
                        quantity: 1
                    })
                    cart.totalItems = 1;
                    cart.totalPrice = product.price;
                    const val = await cart.save();
                    return res.status(200).json({ status: true, message: "Product updated", data: val });
                }
            }
            else {

                if (cartByUser.items.length > 0) {
                    // console.log(cart.items)
                    let checkPro = (cartByUser.items).find(x => (x.productId).toString() === (productId).toString());
                    if (!checkPro) {
                        cartByUser.items.push({
                            productId: productId,
                            quantity: 1
                        })
                        cartByUser.totalItems += 1;
                        cartByUser.totalPrice += product.price;
                        const val = await cartByUser.save();
                        return res.status(200).json({ status: true, message: "Product updated", data: val });
                    }
                    else {
                        const cartProduct = (cartByUser.items).find(x => (x.productId).toString() === (productId).toString());
                        cartProduct.quantity += 1;
                        cartByUser.totalPrice += product.price;
                        const val = await cartByUser.save();
                        return res.status(200).json({ status: true, message: "Product updated", data: val });
                    }
                }
                else {
                    cartByUser.items.push({
                        productId: productId,
                        quantity: 1
                    })
                    cartByUser.totalItems = 1;
                    cartByUser.totalPrice = product.price;
                    const val = await cartByUser.save();
                    return res.status(200).json({ status: true, message: "Product updated", data: val });
                }
            }
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


const updateCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { cartId, productId, removeProduct } = req.body
        if (!productId) {
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
        if (userId.toString() !== String(req.userId)) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }

        if (cartId) {
            if (!ObjectIdCheck(cartId)) {
                return res.status(400).json({ status: false, message: 'Invalid cartId' });
            }
            const cart = await cartModel.findOne({ _id: cartId, isDeleted: false });
            if (!cart) {
                return res.status(404).json({ status: false, message: 'Cart not found' });
            }
            if (String(cart.userId) !== userId.toString()) {
                return res.status(403).json({ status: false, message: 'Unauthorized' });
            }
        }

        let cart = await cartModel.findOne({ userId: userId, });

        if (removeProduct) {
            if (cart.items.length > 0) {
                let proCheck = (cart.items).find(x => (x.productId).toString() === (productId).toString());
                if (proCheck !== undefined) {
                    cart.items = (cart.items).filter(item => item.productId.toString() !== productId.toString())
                    cart.totalItems -= 1;
                    cart.totalPrice -= product.price;
                    const val = await cart.save();
                    const updatedCart = await cartModel.findById(cartId).lean();
                    updateCart.removeProduct = updatedCart.removeProduct + 1;
                    return res.status(200).json({ status: true, message: "Product updated", data: updatedCart });
                }
                else {
                    return res.status(400).json({ status: false, message: "Product does not exist" });
                }
            }
            return res.status(200).json({ status: true, message: "Product updated", data: cart });
        }
        else {
            if (cart.items.length > 0) {
                let proCheck = (cart.items).find(x => (x.productId).toString() === (productId).toString());
                if (proCheck !== undefined) {
                    cart.items = (cart.items).filter(item => item.productId.toString() !== productId.toString())
                    cart.totalItems -= 1;
                    cart.totalPrice -= product.price;
                    const val = await cart.save();
                    val.removeProduct = 1;
                    return res.status(200).json({ status: true, message: "Product updated", data: val });
                }
                else {
                    return res.status(400).json({ status: false, message: "Product does not exist" });
                }
            }
            cart.totalItems = 0;
            cart.totalPrice = 0;
            const val = await cart.save();
            return res.status(200).json({ status: true, message: "Product updated", data: val });
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



const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Invalid userId' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        if (String(userId) !== (req.userId).toString()) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }
        const cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Cart not found' });
        }
        return res.status(200).json({ status: true, message: 'Cart found', data: cart });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}


const cartDelete = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Invalid userId' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        if (userId.toString() !== (req.userId).toString()) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }
        const cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Cart not found' });
        }
        cart.totalItems = 0;
        cart.totalPrice = 0;
        cart.items = [];
        let val = await cart.save();
        return res.status(204).send({
            status: true,
            message: 'Success',
            data: val
        })

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}


module.exports = {
    createCart,
    updateCart,
    getCart,
    cartDelete
}