const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/*{
  userId: {ObjectId, refs to User, mandatory},
  items: [{
    productId: {ObjectId, refs to Product model, mandatory},
    quantity: {number, mandatory, min 1}
  }],
  totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
  totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
  totalQuantity: {number, mandatory, comment: "Holds total number of quantity in the cart"},
  cancellable: {boolean, default: true},
  status: {string, default: 'pending', enum[pending, completed, cancled]},
  deletedAt: {Date, when the document is deleted}, 
  isDeleted: {boolean, default: false},
  createdAt: {timestamp},
  updatedAt: {timestamp},
} */
const orderSchema = new mongoose.Schema({
    userId : {
        type: ObjectId,
        required: true,
        ref : "User",
    },
    items : [
        {
            productId : {
                type: ObjectId,
                required: true,
                ref : "Product",
            },
            quantity : {
                type: Number,
                required: true,
                min : 1
            },
        }
    ],
    totalPrice : {
        type: Number,
        required: true,
        comment : "Holds total price of all the items in the cart",
    },
    totalItems : {
        type: Number,
        required: true,
        comment : "Holds total number of items in the cart",
    },
    totalQuantity : {
        type: Number,
        required: true,
        comment : "Holds total number of quantity in the cart",
    },
    cancellable : {
        type: Boolean,
        default: true,
    },
    status : {
        type: String,
        default: 'pending',
        enum: ["pending", "completed", "cancled"],
    },
    deletedAt : {
        type: Date,
    },
    isDeleted : {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);