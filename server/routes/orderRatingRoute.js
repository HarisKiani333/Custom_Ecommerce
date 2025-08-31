import express from "express";
import {
  createOrderRating,
  getOrderRating,
  getUserOrderRatings,
  updateOrderRating,
  deleteOrderRating,
  canUserRateOrder,
  getOrderRatingStats
} from "../controllers/orderRatingController.js";
import { authUser } from "../middleware/authUser.js";

const orderRatingRouter = express.Router();

// Create a new order rating (requires authentication)
orderRatingRouter.post("/create", authUser, createOrderRating);

// Get order rating by order ID (requires authentication)
orderRatingRouter.get("/order/:orderId", authUser, getOrderRating);

// Get all order ratings for a user (requires authentication)
orderRatingRouter.get("/user", authUser, getUserOrderRatings);

// Update order rating (requires authentication)
orderRatingRouter.put("/update/:ratingId", authUser, updateOrderRating);

// Delete order rating (requires authentication)
orderRatingRouter.delete("/delete/:ratingId", authUser, deleteOrderRating);

// Check if user can rate an order (requires authentication)
orderRatingRouter.get("/can-rate/:orderId", authUser, canUserRateOrder);

// Get order rating statistics (public)
orderRatingRouter.get("/stats", getOrderRatingStats);

export default orderRatingRouter;