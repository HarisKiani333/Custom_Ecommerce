import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required - No token provided",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id; // ✅ store directly on req
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token - Missing user ID",
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired - Please login again",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token format" });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error: " + error.message,
    });
  }
};
