import OrderRating from "../models/OrderRating.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// Create a new order rating
export const createOrderRating = async (req, res) => {
  try {
    const {
      orderId,
      overallRating,
      deliveryRating,
      packagingRating,
      customerServiceRating,
      review,
      wouldRecommend,
      tags
    } = req.body;
    const userId = req.userId;

    if (!userId || !orderId || !overallRating) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (orderId, overallRating)",
      });
    }

    // Validate overall rating value
    if (!Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Overall rating must be an integer between 1 and 5",
      });
    }

    // Validate optional ratings
    const optionalRatings = [deliveryRating, packagingRating, customerServiceRating];
    for (const rating of optionalRatings) {
      if (rating !== undefined && rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: "All ratings must be integers between 1 and 5",
        });
      }
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

    // Check if order is paid and eligible for rating
    if (!order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be rated",
      });
    }

    // Check if order status allows rating (only delivered/completed orders)
    const eligibleStatuses = ["Delivered", "Completed"];
    if (!eligibleStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Only delivered or completed orders can be rated",
      });
    }

    // Check if rating already exists for this user-order combination
    const existingRating = await OrderRating.findOne({ userId, orderId });
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this order",
      });
    }

    // Create new order rating
    const newOrderRating = await OrderRating.create({
      userId,
      orderId,
      overallRating,
      deliveryRating,
      packagingRating,
      customerServiceRating,
      review: review || "",
      wouldRecommend,
      tags: tags || []
    });

    await newOrderRating.populate("userId", "name");

    res.json({
      success: true,
      message: "Order rating submitted successfully",
      orderRating: newOrderRating,
    });
  } catch (error) {
    console.error("Error creating order rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit order rating",
    });
  }
};

// Get order rating by order ID
export const getOrderRating = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Order ID are required",
      });
    }

    const orderRating = await OrderRating.findOne({ userId, orderId })
      .populate("userId", "name")
      .populate("orderId");

    res.json({
      success: true,
      orderRating,
    });
  } catch (error) {
    console.error("Error fetching order rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order rating",
    });
  }
};

// Get all order ratings for a user
export const getUserOrderRatings = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const skip = (page - 1) * limit;

    const orderRatings = await OrderRating.find({ userId })
      .populate("userId", "name")
      .populate("orderId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRatings = await OrderRating.countDocuments({ userId });

    res.json({
      success: true,
      orderRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
      },
    });
  } catch (error) {
    console.error("Error fetching user order ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order ratings",
    });
  }
};

// Update order rating
export const updateOrderRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const {
      overallRating,
      deliveryRating,
      packagingRating,
      customerServiceRating,
      review,
      wouldRecommend,
      tags
    } = req.body;
    const userId = req.userId;

    if (!userId || !ratingId) {
      return res.status(400).json({
        success: false,
        message: "Rating ID is required",
      });
    }

    // Validate ratings if provided
    const ratings = [overallRating, deliveryRating, packagingRating, customerServiceRating];
    for (const rating of ratings) {
      if (rating !== undefined && rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: "All ratings must be integers between 1 and 5",
        });
      }
    }

    const existingRating = await OrderRating.findOne({ _id: ratingId, userId });
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: "Order rating not found or access denied",
      });
    }

    const updateData = {};
    if (overallRating !== undefined) updateData.overallRating = overallRating;
    if (deliveryRating !== undefined) updateData.deliveryRating = deliveryRating;
    if (packagingRating !== undefined) updateData.packagingRating = packagingRating;
    if (customerServiceRating !== undefined) updateData.customerServiceRating = customerServiceRating;
    if (review !== undefined) updateData.review = review;
    if (wouldRecommend !== undefined) updateData.wouldRecommend = wouldRecommend;
    if (tags !== undefined) updateData.tags = tags;

    const updatedRating = await OrderRating.findByIdAndUpdate(
      ratingId,
      updateData,
      { new: true }
    ).populate("userId", "name");

    res.json({
      success: true,
      message: "Order rating updated successfully",
      orderRating: updatedRating,
    });
  } catch (error) {
    console.error("Error updating order rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order rating",
    });
  }
};

// Delete order rating
export const deleteOrderRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.userId;

    if (!userId || !ratingId) {
      return res.status(400).json({
        success: false,
        message: "Rating ID is required",
      });
    }

    const deletedRating = await OrderRating.findOneAndDelete({
      _id: ratingId,
      userId,
    });

    if (!deletedRating) {
      return res.status(404).json({
        success: false,
        message: "Order rating not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Order rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order rating",
    });
  }
};

// Check if user can rate an order
export const canUserRateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Order ID are required",
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

    // Check if order is paid
    if (!order.isPaid) {
      return res.json({
        success: true,
        canRate: false,
        reason: "Order must be paid to be rated",
        isPaid: false,
      });
    }

    // Check if order status allows rating (only delivered/completed orders)
    const eligibleStatuses = ["Delivered", "Completed"];
    if (!eligibleStatuses.includes(order.status)) {
      return res.json({
        success: true,
        canRate: false,
        reason: "Only delivered or completed orders can be rated",
        status: order.status,
      });
    }

    // Check if user has already rated this order
    const existingRating = await OrderRating.findOne({ userId, orderId });

    res.json({
      success: true,
      canRate: !existingRating,
      hasRated: !!existingRating,
      isPaid: order.isPaid,
      status: order.status,
      reason: existingRating ? "Order already rated" : null,
    });
  } catch (error) {
    console.error("Error checking order rating eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check order rating eligibility",
    });
  }
};

// Get order rating statistics
export const getOrderRatingStats = async (req, res) => {
  try {
    const stats = await OrderRating.aggregate([
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageOverallRating: { $avg: "$overallRating" },
          averageDeliveryRating: { $avg: "$deliveryRating" },
          averagePackagingRating: { $avg: "$packagingRating" },
          averageCustomerServiceRating: { $avg: "$customerServiceRating" },
          recommendationRate: {
            $avg: {
              $cond: [{ $eq: ["$wouldRecommend", true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const ratingDistribution = await OrderRating.aggregate([
      {
        $group: {
          _id: "$overallRating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const topTags = await OrderRating.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalRatings: 0,
        averageOverallRating: 0,
        averageDeliveryRating: 0,
        averagePackagingRating: 0,
        averageCustomerServiceRating: 0,
        recommendationRate: 0
      },
      ratingDistribution,
      topTags
    });
  } catch (error) {
    console.error("Error fetching order rating stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order rating statistics",
    });
  }
};