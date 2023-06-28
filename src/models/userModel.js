const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname : {
        type: String,
        required: true
    },
    lname : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email']
    },
    profileImage : {
        type: String,
        required: true
    },
    phone : {
        type: String,
        required: true,
        unique: true,
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid Indian mobile number']
    },
    password : {
        type: String,
        required: true,
        minLen: 8,
        maxLen: 15
    },
    address : {
        shipping: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            }
        },
        billing: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true,
            },
            pincode: {
                type: Number,
                required: true
            }
        }
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);


/* { ~
  fname: {string, mandatory},
  lname: {string, mandatory},
  email: {string, mandatory, valid email, unique},
  profileImage: {string, mandatory}, // s3 link
  phone: {string, mandatory, unique, valid Indian mobile number}, 
  password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
  address: {
    shipping: {
      street: {string, mandatory},
      city: {string, mandatory},
      pincode: {number, mandatory}
    },
    billing: {
      street: {string, mandatory},
      city: {string, mandatory},
      pincode: {number, mandatory}
    }
  },
  createdAt: {timestamp},
  updatedAt: {timestamp}
}*/