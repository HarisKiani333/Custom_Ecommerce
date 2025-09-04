import User from "../models/User.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { logError, logSuccess, sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";

// Standardized cookie options for user authentication
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
};

// register user : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendErrorResponse(res, "Missing Details", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, "User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, cookieOptions);

    return sendSuccessResponse(res, {
      user: { email: user.email, name: user.name, id: user._id },
    }, "Registration successful");
  } catch (error) {
    // Handle MongoDB unique constraint violations
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return sendErrorResponse(res, "Email address is already registered. Please use a different email or try logging in.", 409);
      }
      return sendErrorResponse(res, "A user with this information already exists.", 409);
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendErrorResponse(res, validationErrors.join('. '), 400);
    }
    
    return sendErrorResponse(res, error.message, 500);
  }
};

// login user :: /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendErrorResponse(res, "Missing Details", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid Password", 401);
    }

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, cookieOptions);

    return sendSuccessResponse(res, {
      user: { email: user.email, name: user.name, id: user._id },
    }, "Login successful");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

// logout user :: /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
    return sendSuccessResponse(res, null, "Logout Successful", 200);
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'user_logout' });
  }
};

// check authorization : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return sendErrorResponse(res, "User ID not provided", 401);
    }
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    return sendSuccessResponse(res, {
      user: {
        email: user.email,
        name: user.name,
        id: user._id,
        cartItems: user.cartItems || {}
      }
    }, "User authenticated successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = JWT.sign({ id: req.userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, cookieOptions);
    return sendSuccessResponse(res, null, "Token refreshed successfully", 200);
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'refresh_token', userId: req.userId });
  }
};
