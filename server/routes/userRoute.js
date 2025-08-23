import express from "express";
import {
  login,
  register,
  logout,
  isAuth,
} from "../controllers/userController.js";
import { authUser } from "../middleware/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/logout", logout);

export default userRouter;
