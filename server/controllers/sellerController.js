import jwt from "jsonwebtoken";

export const loginSeller = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Missing Details" });
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  )
    return res.json({ success: false, message: "Not Authorized" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("sellerToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
  return res.json({ success: true, message: "Login Successful" });
};

export const logoutSeller = async (req, res) => {
  res.clearCookie("sellerToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  return res.json({ success: true, message: "Logout Successful" });
};

export const isSellerAuth = (req, res) => {
  try {
    const token = req.cookies.sellerToken;
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ success: true, message: "Authorized", user: decoded });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message || "Not Authorized",
    });
  }
};
