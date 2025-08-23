import User from "../models/User.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// register user : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // getting user details from the webpage in form of request

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" }); // if any of the required detail is missing return response in json form

    const existingUser = await User.findOne({ email }); // checks if the user with email provided exists in the database

    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10); // hashes password for secure storage in database

    const user = await User.create({ name, email, password: hashedPassword }); // creates a new user with password value as the hashed variable

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      // make a token with default user ID and expiring time
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      // make cookie to store token for authentication and authorization in future
      httpOnly: true, // prevent Javascript to access the user details
      secure: process.env.NODE_ENV === "production", // use secure cookie in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // protects against CSRF attacks
      maxAge: 1 * 24 * 60 * 60 * 1000, // cookie expiration time
    });

    return res.json({
      success: true,
      message: "Registration successful",
      user: { email: user.email, name: user.name, id: user._id }
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
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
      // make a token with default user ID and expiring time
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      // make cookie to store token for authentication and authorization in future
      httpOnly: true, // prevent Javascript to access the user details
      secure: process.env.NODE_ENV === "production", // use secure cookie in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // protects against CSRF attacks
      maxAge: 1 * 24 * 60 * 60 * 1000, // cookie expiration time
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: { email: user.email, name: user.name, id: user._id }
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//check authorization : /api/user/is-auth

export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select("-password");
    if (user) {
      return res.json({ success: true, user });
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// logout User : /api/user/logout

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "User Logged Out" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
