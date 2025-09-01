// to add products in database <--> shown in productList on frontend
//path /api/product/add
import Product from "../models/Product.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";
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
    
    // Get the admin user (seller) ID
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) {
      return res.json({ success: false, message: "Seller not found. Please contact administrator." });
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
      sellerId: adminUser._id, // Add sellerId to the product
    });
    
    console.log('Product created successfully:', newProduct._id);
    res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error('Product addition error:', error);
    
    // Handle MongoDB unique constraint violations
    if (error.code === 11000) {
      // Check if it's the composite unique constraint on sellerId + name
      if (error.keyPattern && error.keyPattern.sellerId && error.keyPattern.name) {
        return res.json({ 
          success: false, 
          message: "A product with this name already exists in your inventory. Please use a different product name.",
          constraintViolation: "product_name"
        });
      }
      return res.json({ 
        success: false, 
        message: "A product with this information already exists.",
        constraintViolation: "duplicate"
      });
    }
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}`
      });
    }
    
    res.json({ success: false, message: error.message || "Product not added" });
  }
};

//path /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    console.log('Products found:', products.length);
    
    if (products.length === 0) {
      return res.json({ success: true, products: [], message: "No products found" });
    }
    
    // Get rating statistics for all products
    const productIds = products.map(product => product._id);
    const ratingStats = await Rating.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    
    // Create a map for quick lookup
    const ratingsMap = {};
    ratingStats.forEach(stat => {
      ratingsMap[stat._id.toString()] = {
        rating: Math.round(stat.averageRating * 10) / 10,
        totalRatings: stat.totalRatings
      };
    });
    
    // Add rating data to products
    const productsWithRatings = products.map(product => ({
      ...product.toObject(),
      rating: ratingsMap[product._id.toString()]?.rating || 0,
      totalRatings: ratingsMap[product._id.toString()]?.totalRatings || 0
    }));
    
    res.json({ success: true, products: productsWithRatings });
  } catch (error) {
    console.error('Product list error:', error);
    res.json({ success: false, message: "Failed to fetch products" });
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
    
    // Get rating statistics for this product
    const ratingStats = await Rating.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    
    const productWithRating = {
      ...product.toObject(),
      rating: ratingStats[0]?.averageRating ? Math.round(ratingStats[0].averageRating * 10) / 10 : 0,
      totalRatings: ratingStats[0]?.totalRatings || 0
    };
    
    res.json({ success: true, product: productWithRating });
  } catch (error) {
    res.json({ success: false, message: "Product not found" });
    console.log(error);
  }
};

// to change stock of product in databse
//path /api/product/stock
// Fixed version
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body || {};  // ✅ Extract product ID from request body
    
    // ✅ Validate product ID
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required." });
    }
    
    // ✅ Validate inStock parameter
    if (typeof inStock !== 'boolean') {
      return res
        .status(400)
        .json({ success: false, message: "Stock status must be a boolean value." });
    }
    
    // ✅ Use the correct product ID to find and update
    const updatedProduct = await Product.findByIdAndUpdate(
      id,  // ✅ Use product ID instead of userId
      { inStock },
      { new: true }
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
