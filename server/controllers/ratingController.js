import Rating from "../models/Rating.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new rating
export const createRating = async (req, res) => {
  try {
    const { productId, orderId, rating, review } = req.body;
    const userId = req.userId;

    if (!userId || !productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate rating value
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate review length if provided
    if (review && review.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review must be less than 1000 characters",
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    // Check if product exists in the order
    const productInOrder = order.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!productInOrder) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    // Check if rating already exists for this user-product combination
    const existingRating = await Rating.findOne({ userId, productId });
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this product",
      });
    }

    // Create new rating
    const newRating = await Rating.create({
      userId,
      productId,
      orderId,
      rating,
      review: review || "",
      isVerifiedPurchase: true,
    });

    await newRating.populate("userId", "name");

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit rating",
    });
  }
};

// Get ratings for a specific product
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!productId) {
      return res.json({
        success: false,
        message: "Product ID is required",
      });
    }

    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRatings = await Rating.countDocuments({ productId });
    const averageRating = await Rating.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const ratingStats = averageRating[0] || {
      averageRating: 0,
      totalRatings: 0,
    };

    res.json({
      success: true,
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
      },
      stats: {
        averageRating: Math.round(ratingStats.averageRating * 10) / 10,
        totalRatings: ratingStats.totalRatings,
      },
    });
  } catch (error) {
    console.error("Error fetching product ratings:", error);
    res.json({
      success: false,
      message: "Failed to fetch ratings",
    });
  }
};

// Get user's rating for a specific product
export const getUserProductRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId || !productId) {
      return res.json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    const rating = await Rating.findOne({ userId, productId }).populate(
      "userId",
      "name"
    );

    res.json({
      success: true,
      rating,
    });
  } catch (error) {
    console.error("Error fetching user rating:", error);
    res.json({
      success: false,
      message: "Failed to fetch user rating",
    });
  }
};

// Update user's rating
export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    if (!userId || !ratingId) {
      return res.json({
        success: false,
        message: "Rating ID is required",
      });
    }

    // Validate rating value if provided
    if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const existingRating = await Rating.findOne({ _id: ratingId, userId });
    if (!existingRating) {
      return res.json({
        success: false,
        message: "Rating not found or access denied",
      });
    }

    const updateData = {};
    if (rating) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      updateData,
      { new: true }
    ).populate("userId", "name");

    res.json({
      success: true,
      message: "Rating updated successfully",
      rating: updatedRating,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.json({
      success: false,
      message: "Failed to update rating",
    });
  }
};

// Delete user's rating
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.userId;

    if (!userId || !ratingId) {
      return res.json({
        success: false,
        message: "Rating ID is required",
      });
    }

    const rating = await Rating.findOne({ _id: ratingId, userId });
    if (!rating) {
      return res.json({
        success: false,
        message: "Rating not found or access denied",
      });
    }

    await Rating.findByIdAndDelete(ratingId);

    res.json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.json({
      success: false,
      message: "Failed to delete rating",
    });
  }
};

// Get user's ratings for multiple products
export const getUserProductRatings = async (req, res) => {
  try {
    const { productIds } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!productIds) {
      return res.status(400).json({
        success: false,
        message: "Product IDs are required",
      });
    }

    const productIdArray = productIds.split(',').filter(id => id.trim());
    
    if (productIdArray.length === 0) {
      return res.json({
        success: true,
        ratings: [],
      });
    }

    const ratings = await Rating.find({ 
      userId, 
      productId: { $in: productIdArray } 
    }).populate("userId", "name");

    const ratingsMap = {};
    ratings.forEach(rating => {
      ratingsMap[rating.productId] = rating;
    });

    res.json({
      success: true,
      ratings: ratingsMap,
    });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user ratings",
    });
  }
};

// Check if user can rate a product (has purchased it)
export const canUserRate = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId || !productId) {
      return res.json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      userId,
      "items.productId": productId,
      status: { $in: ["Delivered", "Order Placed"] }, // Allow rating for delivered or placed orders
    });

    // Check if user has already rated this product
    const existingRating = await Rating.findOne({ userId, productId });

    res.json({
      success: true,
      canRate: !!order && !existingRating,
      hasPurchased: !!order,
      hasRated: !!existingRating,
      orderId: order?._id,
    });
  } catch (error) {
    console.error("Error checking rating eligibility:", error);
    res.json({
      success: false,
      message: "Failed to check rating eligibility",
    });
  }
};