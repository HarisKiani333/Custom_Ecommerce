import express from "express";
import {
  login,
  register,
  logout,
  isAuth,
  refreshToken, // Add this import
} from "../controllers/userController.js";
import { authUser } from "../middleware/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/refresh", refreshToken); // Add this route
userRouter.post("/logout", logout);

export default userRouter;
