import express from "express";
import {
  loginSeller,
  logoutSeller,
  isSellerAuth,
} from "../controllers/sellerController.js";
import authSeller from "../middleware/authSeller.js";

const sellerRouter = express.Router();
sellerRouter.post("/login", loginSeller);
sellerRouter.get("/logout", logoutSeller);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);

export default sellerRouter;
