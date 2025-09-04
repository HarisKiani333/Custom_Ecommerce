import jwt from "jsonwebtoken";
import { logError, sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";

// Standardized cookie options for seller authentication
const sellerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    
    res.cookie("sellerToken", token, sellerCookieOptions);
    return sendSuccessResponse(res, "Login Successful", null, 200);
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'seller_login', email: req.body?.email });
  }
};

export const logoutSeller = async (req, res) => {
  try {
    res.clearCookie("sellerToken", sellerCookieOptions);
    return sendSuccessResponse(res, "Logout Successful", null, 200);
  } catch (error) {
    return sendErrorResponse(res, error, 500, { context: 'seller_logout' });
  }
};

export const isSellerAuth = (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return sendSuccessResponse(res, "Authorized", { user: decoded }, 200);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return sendErrorResponse(res, error, 401, { context: 'seller_auth_check' });
  }
};
