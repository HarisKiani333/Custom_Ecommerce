import User from "../models/User";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// register user : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // getting user details from the webpage in form of request

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" }); // if any of the required detail is missing return response in json form

    existingUser = await User.findOne({ email }); // checks if the user with email provided exists in the databse

    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    hashedPassword = await bcrypt.hash(password, 10); // hashes password for secure storage in databse

    const user = await User.create({ name, email, password: hashedPassword }); // creates a new user with password value as the hashed variable

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      // make a token with default user ID and expiring time
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      // make cookie to store token for authentication and authorization in futre
      httpOnly: true, // prevent Javascript to access the user details
      secure: process.env.NODE_ENV === "production", // use secure cookie in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // protects against CSRF attacks
      maxAge: 1 * 24 * 60 * 60 * 1000, // cookie expiration time
    });

    return res.json({
      success: true,
      message: { user: user.email, name: user.name },
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
