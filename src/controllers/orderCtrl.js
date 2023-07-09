const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const { ObjectIdCheck } = require('../utils/validations')
const cartModel = require('../models/cartModel');

const createOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { status, cancellable } = req.body;
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
        if (status) {
            const arr = ["pending", "completed", "cancled"];
            if (!arr.includes(status)) {
                return res.status(400).json({ status: false, message: 'Invalid status' });
            }
        }
        const cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Cart not found' });
        }
        const totalQuantity = (cart.items).reduce((sum, item) => sum + item.quantity, 0);
        const orderDetails = {
            userId: userId,
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            totalQuantity: totalQuantity,
            cancellable: (cancellable) ? cancellable : true,
            status: (status) ? status : 'pending',
        }

        const order = await orderModel.create(orderDetails);
        return res.status(201).json({ status: true, message: 'Order created', data: order });

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

const updateOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { orderId, status } = req.body;
        if (!orderId || !userId) {
            return res.status(400).json({ status: false, message: 'OrderId or UserId not found' });
        }
        if (!ObjectIdCheck(orderId) || !ObjectIdCheck(userId)) {
            return res.status(400).json({ status: false, message: 'Invalid orderId/userId' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        if (userId.toString() !== (req.userId).toString()) {
            return res.status(403).json({ status: false, message: 'Unauthorized' });
        }
        const order = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false });
        if (!order) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }
        if (!status) {
            return res.status(400).json({ status: false, message: 'Please enter data status' });
        }
        if (order.status == "completed") {
            return res.status(400).json({ status: false, message: 'Order already completed' });
        }
        if (order.status == "cancled") {
            return res.status(400).json({ status: false, message: 'Order already cancled' });
        }
        if (order.status == "pending") {
            const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { $set: { status: status } }, { new: true });
            return res.status(200).json({ status: true, message: 'Order updated', data: updateOrder });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}
module.exports = {
    createOrder,
    updateOrder,
}