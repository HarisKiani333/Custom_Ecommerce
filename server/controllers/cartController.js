import User from "../models/User.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";

//updating cart data on path : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems } = req.body || {};
    
    if (!userId) {
      return sendErrorResponse(res, "User ID is required", 400);
    }

    const user = await User.findByIdAndUpdate(userId, { cartItems }, { new: true });
    
    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    return sendSuccessResponse(res, {}, "Cart updated successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendErrorResponse(res, "User ID is required", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    return sendSuccessResponse(res, {
      cartItems: user.cartItems || [],
    }, "Cart fetched successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};