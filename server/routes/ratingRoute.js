import express from "express";
import {
  createRating,
  getProductRatings,
  getUserProductRating,
  getUserProductRatings,
  updateRating,
  deleteRating,
  canUserRate,
} from "../controllers/ratingController.js";
import { authUser } from "../middleware/authUser.js";

const ratingRouter = express.Router();

// Create a new rating (requires authentication)
ratingRouter.post("/create", authUser, createRating);

// Get all ratings for a specific product (public)
ratingRouter.get("/product/:productId", getProductRatings);

// Get user's rating for a specific product (requires authentication)
ratingRouter.get("/user/:productId", authUser, getUserProductRating);

// Get user's ratings for multiple products (requires authentication)
ratingRouter.get("/user-ratings", authUser, getUserProductRatings);

// Update user's rating (requires authentication)
ratingRouter.put("/update/:ratingId", authUser, updateRating);

// Delete user's rating (requires authentication)
ratingRouter.delete("/delete/:ratingId", authUser, deleteRating);

// Check if user can rate a product (requires authentication)
ratingRouter.get("/can-rate/:productId", authUser, canUserRate);

export default ratingRouter;