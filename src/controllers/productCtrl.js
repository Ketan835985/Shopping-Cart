const { uploadFiles } = require('../aws/aws');
const productModel = require('../models/productModel');
const { sizeCheck } = require('../utils/proValidation');



const createProduct = async (req, res) => {
    try {
        const files = req.files;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = req.body;
        if (!title || !description || !price || !currencyId || !currencyFormat || !isFreeShipping  || !style || !availableSizes || !installments) {
            res.status(400).json({ status: false, message: 'Please enter all fields' });
        }
        const product = await productModel.findOne({ title });
        if (product) {
            res.status(400).json({ status: false, message: 'Product Title already exists' });
        }
        if(! sizeCheck(availableSizes)){
            res.status(400).json({ status: false, message: 'Please enter valid sizes' });
        }
        if(! Number.isInteger(Number(price))){
            res.status(400).json({ status: false, message: 'Please enter valid price' });
        }
        if(currencyId != "INR"){
            res.status(400).json({ status: false, message: 'Please enter valid currency' });
        }
        if(currencyFormat != '₹'){
            res.status(400).json({ status: false, message: 'Please enter valid currency format' });
        }
        if (files.length === 0) {
            res.status(400).json({ status: false, message: 'Please upload product image' });
        }
        const url = await uploadFiles(files[0]);
        productImage = url;

        
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