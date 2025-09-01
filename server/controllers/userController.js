import User from "../models/User.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { logError, logSuccess, sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";

// 🔴 CRITICAL: Define standardized cookie options at the top
const setCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// register user : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Use standardized cookie options
    res.cookie("token", token, setCookieOptions);

    return res.json({
      success: true,
      message: "Registration successful",
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    // Handle MongoDB unique constraint violations
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern && error.keyPattern.email) {
        return res.json({ 
          success: false, 
          message: "Email address is already registered. Please use a different email or try logging in.",
          constraintViolation: "email"
        });
      }
      return res.json({ 
        success: false, 
        message: "A user with this information already exists.",
        constraintViolation: "duplicate"
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.json({ 
        success: false, 
        message: validationErrors.join('. '),
        constraintViolation: "validation"
      });
    }
    
    return sendErrorResponse(res, error, 500, { context: 'user_registration', email });
  }
};

// login user :: /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ success: false, message: "Missing Details" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ success: false, message: "Invalid Password" });

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Use standardized cookie options
    res.cookie("token", token, setCookieOptions);

    return res.json({
      success: true,
      message: "Login successful",
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'user_login', email });
  }
};

// logout user :: /api/user/logout
export const logout = async (req, res) => {
  try {
    // Use same options for clearing cookie
    res.clearCookie("token", setCookieOptions);
    return res.json({ success: true, message: "User Logged Out" });
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'user_logout' });
  }
};

// check authorization : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID not provided" 
      });
    }
    
    const user = await User.findById(userId).select("-password");
    if (user) {
      // Return consistent user object structure with 'id' property
      return res.json({ 
        success: true, 
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
          cartItems: user.cartItems || {}
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error('isAuth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add this new function for token refresh
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }
    
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Generate new token
    const newToken = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    
    // Set new cookie with standardized options
    res.cookie("token", newToken, setCookieOptions);
    
    return res.json({
      success: true,
      message: "Token refreshed successfully",
      user: { email: user.email, name: user.name, id: user._id }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token refresh failed: " + error.message,
    });
  }
};
