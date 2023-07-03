const { isValidObjectId } = require('mongoose');
const { uploadFiles } = require('../aws/aws');
const productModel = require('../models/productModel');
const { sizeCheck } = require('../utils/proValidation');



const createProduct = async (req, res) => {
    try {
        const files = req.files;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = req.body;
        if (!title || !description || !price || !currencyId || !currencyFormat || !isFreeShipping || !style || !availableSizes || !installments) {
            res.status(400).json({ status: false, message: 'Please enter all fields' });
        }
        const product = await productModel.findOne({ title });
        if (product) {
            res.status(400).json({ status: false, message: 'Product Title already exists' });
        }
        if (availableSizes.length === 0) {
            res.status(400).json({ status: false, message: 'Please enter valid sizes' });
        }
        if (!sizeCheck(availableSizes)) {
            res.status(400).json({ status: false, message: 'Please enter valid sizes' });
        }
        if (!Number.isInteger(Number(price))) {
            res.status(400).json({ status: false, message: 'Please enter valid price' });
        }
        if (currencyId != "INR") {
            res.status(400).json({ status: false, message: 'Please enter valid currency' });
        }
        if (currencyFormat != '₹') {
            res.status(400).json({ status: false, message: 'Please enter valid currency format' });
        }
        if (files.length === 0) {
            res.status(400).json({ status: false, message: 'Please upload product image' });
        }
        const url = await uploadFiles(files[0]);
        productImage = url;
        const productDetail = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            currencyFormat: currencyFormat,
            isFreeShipping: isFreeShipping,
            productImage: productImage,
            style: style,
            availableSizes: availableSizes,
            installments: installments
        }

        const newProduct = await productModel.create(productDetail);
        res.status(200).json({ status: true, message: 'Product Created', data: newProduct });
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

const getProduct = async (req, res) => {
    try {
        const { size, priceSort, name, priceGreaterThan, priceLessThan } = req.query;
        const filterDetail = { isDeleted: false };
        if (size) {
            filterDetail.availableSizes = size;
        }
        if (name) {
            filterDetail.title = { $regex: name, $options: 'i' };
        }
        if (priceGreaterThan) {
            filter.price = { $gt: parseFloat(priceGreaterThan) };
        }
        if (priceLessThan) {
            filter.price = { ...filter.price, $lt: parseFloat(priceLessThan) };
        }
        let sortOption = {};
        if (priceSort) {
            sortOption.price = parseInt(priceSort);
        }
        const products = await productModel.find(filterDetail).sort(sortOption);
        res.status(200).json({ status: true, message: 'Products found', data: products });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        if(!productId){
            return res.status(400).json({status:false, message: 'ProductId not found' });
        }
        if(! isValidObjectId(productId)){
            return res.status(400).json({status: false, message: 'Invalid productId' });
        }
        const product = await productModel.findOne({_id:productId, isDeleted: false}); 
        if(! product){
            return res.status(404).json({status: false, message: 'Product not found' });
        }
        res.status(200).json({ status: true, message: 'Product found', data: product });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const {} = req.body;
        const productId = req.params.productId;
        if(!productId){
            return res.status(400).json({status:false, message: 'ProductId not found' });
        }
        if(! isValidObjectId(productId)){
            return res.status(400).json({status: false, message: 'Invalid productId' });
        }
        const product = await productModel.findById(productId);
        if(! product){
            return res.status(404).json({status: false, message: 'Product not found' });
        }
        if(!req.body){
            return res.status(400).json({status: false, message: 'Please enter data' });
        }
        const updatedProduct = await productModel.findOneAndUpdate({_id:productId, isDeleted: false}, req.body, {new: true});
        if(!updatedProduct){
            return res.status(404).json({status: false, message: 'Product not found' });
        }
        res.status(200).json({ status: true, message: 'Product updated', data: updatedProduct });
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

const deletedProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        if(!productId){
            return res.status(400).json({status:false, message: 'ProductId not found' });
        }
        if(! isValidObjectId(productId)){
            return res.status(400).json({status: false, message: 'Invalid productId' });
        }
        const product = await productModel.findOne({_id:productId, isDeleted: false});
        if(! product){
            return res.status(404).json({status: false, message: 'Product not found' });
        }
        product.isDeleted = true;
        await product.save();
        res.status(200).json({ status: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {
    createProduct, getProduct, getProductById, updateProduct
}