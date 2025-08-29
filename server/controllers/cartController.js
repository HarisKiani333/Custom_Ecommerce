import User from "../models/User.js";

//updating cart data on path : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems } = req.body || {};
    await User.findByIdAndUpdate(userId, { cartItems });
    res.json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCart = async (req, res) => {
  try {
    // Get userId from authUser middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Cart fetched successfully",
      cartItems: user.cartItems || [],
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};