  const { uploadFiles } = require("../aws/aws");
  const productModel = require("../models/productModel");
  const { sizeCheck } = require("../utils/proValidation");
  const { ObjectIdCheck } = require("../utils/validations");

  const createProduct = async (req, res) => {
    try {
      const files = req.files;
      let {
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        style,
        availableSizes,
        installments,
        productImage,
      } = req.body;
      if (
        !title ||
        !description ||
        !price ||
        !currencyId ||
        !currencyFormat ||
        !isFreeShipping ||
        !style ||
        !availableSizes ||
        !installments
      ) {
        return res
          .status(400)
          .json({ status: false, message: "Please enter all fields" });
      }
      const product = await productModel.findOne({ title });
      if (product) {
        return res
          .status(400)
          .json({ status: false, message: "Product Title already exists" });
      }
      if (
        !sizeCheck(
          availableSizes
            .toUpperCase()
            .split(",")
            .map((e) => e.trim())
        )
      ) {
        return res
          .status(400)
          .json({ status: false, message: "Please enter valid sizes" });
      }
      if (Number.isNaN(parseFloat(price))) {
        return res
          .status(400)
          .json({ status: false, message: "Please enter valid price" });
      }
      if (currencyId != "INR") {
        return res
          .status(400)
          .json({ status: false, message: "Please enter valid currency" });
      }
      if (currencyFormat != "₹") {
        return res
          .status(400)
          .json({ status: false, message: "Please enter valid currency format" });
      }
      if (!files) {
        return res
          .status(400)
          .json({ status: false, message: "Please upload product image" });
      }
      
      const productDetail = {
        title: title,
        description: description,
        price: price,
        currencyId: currencyId,
        currencyFormat: currencyFormat,
        isFreeShipping: isFreeShipping,
        style: style,
        availableSizes: availableSizes
        .toUpperCase()
        .split(",")
        .map((e) => e.trim()),
        installments: installments,
      };
      if (files) {
        if (files.length === 0) {
          return res
            .status(400)
            .json({ status: false, message: "Please upload product image" });
        }
        let url = await uploadFiles(files[0]);
        productDetail.productImage = url;
      }
      const newProduct = await productModel.create(productDetail);
      return res
        .status(201)
        .json({ status: true, message: "Product Created", data: newProduct });
    } catch (error) {
      if (error.message.includes("duplicate")) {
        return res.status(400).json({ status: false, message: error.message });
      } else if (error.message.includes("validation")) {
        return res.status(400).json({ status: false, message: error.message });
      } else {
        return res.status(500).json({ status: false, message: error.message });
      }
    }
  };

  const getProduct = async (req, res) => {
    try {
      const { size, priceSort, name, priceGreaterThan, priceLessThan } =
        req.query;
      const filterDetail = { isDeleted: false };
      if (size) {
        filterDetail.availableSizes = size;
      }
      if (name) {
        filterDetail.title = { $regex: name, $options: "i" };
      }
      if (priceGreaterThan) {
        filter.price = { $gt: parseFloat(priceGreaterThan) };
      }
      if (priceLessThan) {
        filter.price = { ...filter.price, $lt: parseFloat(priceLessThan) };
      }
      let sortOption = {};
      if (priceSort) {
        sortOption.price = JSON.parse(parseInt(priceSort));
      }
      const products = await productModel.find(filterDetail).sort(sortOption);
      if (products.length == 0) {
        return res
          .status(404)
          .json({ status: false, message: "Products not found" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Products found", data: products });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  };

  const getProductById = async (req, res) => {
    try {
      const productId = req.params.productId;
      if (!ObjectIdCheck(productId)) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid productId" });
      }
      const product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Product found", data: product });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  };

  const updateProduct = async (req, res) => {
    try {
      const {
        title,
        productImage,
        availableSizes,
        installments,
        style,
        price,
        description,
        currencyFormat,
        isFreeShipping,
      } = req.body;
      const productId = req.params.productId;
      if (!ObjectIdCheck(productId)) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid productId" });
      }
      const product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }
      if (Object.keys(req.body).length == 0 && !req.files) {
        return res
          .status(400)
          .json({ status: false, message: "Please enter data for update" });
      }
      const updateDetail = {};
      if (req.files) {
        if (req.files.length > 0) {
          const url = await uploadFiles(req.files[0]);
          updateDetail.productImage = url;
        }
      }
      if (title) {
        const titleCheck = await productModel.findOne({ title: title });
        if (titleCheck) {
          return res
            .status(400)
            .json({ status: false, message: "Product title already exists" });
        } else {
          updateDetail.title = title;
        }
      }
      if (availableSizes) {
        if (
          !sizeCheck(
            availableSizes
              .toUpperCase()
              .split(",")
              .map((e) => e.trim())
          )
        ) {
          return res
            .status(400)
            .json({ status: false, message: "Product Size not Match" });
        }
      }
      if (installments) {
        updateDetail.installments = installments;
      }
      if (style) {
        updateDetail.style = style;
      }
      if (currencyFormat) {
        if (currencyFormat == "₹") {
          updateDetail.currencyFormat = currencyFormat;
        } else {
          return res
            .status(400)
            .json({ status: false, message: "enterValid Currency Format" });
        }
      }
      if (price) {
        if (Number.isNaN(parseFloat(price))) {
          return res
            .status(400)
            .json({ status: false, message: "Enter the Price value in Number" });
        }
        updateDetail.price = price;
      }
      if (description) {
        updateDetail.description = description;
      }
      if (isFreeShipping) {
        updateDetail.isFreeShipping = isFreeShipping;
      }
      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: productId, isDeleted: false },
        {
          $set: updateDetail,
          $addToSet: { availableSizes: { $each: availableSizes.toUpperCase().split(",") } },
        },
        { new: true }
      );
      if (!updatedProduct) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Product updated", data: updatedProduct });
    } catch (error) {
      if (error.message.includes("duplicate")) {
        return res.status(400).json({ status: false, message: error.message });
      } else if (error.message.includes("validation")) {
        return res.status(400).json({ status: false, message: error.message });
      } else {
        return res.status(500).json({ status: false, message: error.message });
      }
    }
  };

  const deletedProduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      if (!ObjectIdCheck(productId)) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid productId" });
      }
      const product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }
      product.isDeleted = true;
      product.deletedAt = new Date();
      await product.save();
      return res.status(200).json({ status: true, message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  };

  module.exports = {
    createProduct,
    getProduct,
    getProductById,
    updateProduct,
    deletedProduct,
  };
