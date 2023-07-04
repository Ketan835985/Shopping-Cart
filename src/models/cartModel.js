const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref : "User",
    },
    items: [
        {
            productId: {
                type: ObjectId,
                required: true,
                ref : "Product",
            },
            quantity: {
                type: Number,
                required: true,
                min : 1
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        comment : "Holds total price of all the items in the cart",
    },
    totalItems: {
        type: Number,
        required: true,
        comment : "Holds total number of items in the cart",
    }
},{timestamps: true});


module.exports = mongoose.model('Cart', cartSchema);

/*{
  userId: {ObjectId, refs to User, mandatory, unique},
  items: [{
    productId: {ObjectId, refs to Product model, mandatory},
    quantity: {number, mandatory, min 1}
  }],
  totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
  totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
  createdAt: {timestamp},
  updatedAt: {timestamp},
} */ 