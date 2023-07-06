const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    currencyId: {
        type: String,
        required: true,
    },
    currencyFormat: {
        type: String,
        required: true,
        Symbol: '₹',
    },
    isFreeShipping: {
        type: Boolean,
        default: false,
    },
    productImage: {
        type: String,
        required: true,
    },
    style: {
        type: String,
    },
    availableSizes: {
        type: Array(String),
        required: true,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
    },
    installments: {
        type: Number,
    },
    deletedAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);


/*{ 
  title: {string, mandatory, unique},
  description: {string, mandatory},
  price: {number, mandatory, valid number/decimal},
  currencyId: {string, mandatory, INR},
  currencyFormat: {string, mandatory, Rupee symbol},
  isFreeShipping: {boolean, default: false},
  productImage: {string, mandatory},  // s3 link
  style: {string},
  availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
  installments: {number},
  deletedAt: {Date, when the document is deleted}, 
  isDeleted: {boolean, default: false},
  createdAt: {timestamp},
  updatedAt: {timestamp},
} */