// to add products in database <--> shown in productList on frontend
//path /api/product/add
import Product from "../models/Product.js";
import { v2 } from "cloudinary"; // Import v2 directly since we only use v2

export const addProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body.productData);
    console.log('Received files:', req.files);
    
    const productData = JSON.parse(req.body.productData);
    
    const images = req.files;
    if (!images || images.length === 0) {
      return res.json({ success: false, message: "No images provided" });
    }
    
    let imagesUrl = await Promise.all(
      images.map(async (image) => {
        const result = await v2.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );
    
    const newProduct = await Product.create({
      ...productData,
      image: imagesUrl,
    });
    
    console.log('Product created successfully:', newProduct._id);
    res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error('Product addition error:', error);
    res.json({ success: false, message: error.message || "Product not added" });
  }
};

//path /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
    console.log(products);
    if (products.length === 0) {
      return res.json({ success: false, message: "No products found" });
    }
  } catch (error) {
    res.json({ success: false, message: "Product not added" });
    console.log(error);
  }
};

//path /api/product/:id
export const productDetailByID = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.json({ success: false, message: "Product not found" });
    console.log(error);
  }
};

// to change stock of product in databse
//path /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const userId = req.userId;
    const { inStock } = req.body || {};
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required." });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      userId,
      { inStock },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update stock. Please try again.",
      });
  }
};
