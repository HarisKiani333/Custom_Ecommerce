import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;
  if (!sellerToken)
    return res.json({ success: false, message: "Not Authorized" });
  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Not Authorized" });
  }
};
export default authSeller;
