import express from "express";
import {
  placeOrderCOD,
  getSellerOrders,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus, // ✅ Add this import
} from "../controllers/orderController.js";
import { authUser } from "../middleware/authUser.js";
import authSeller from "../middleware/authSeller.js";

const orderRouter = express.Router();

orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/seller", authSeller, getSellerOrders);
orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.put("/update-status", authSeller, updateOrderStatus);
orderRouter.put("/update-payment", authSeller, updatePaymentStatus); // ✅ Add this route

export default orderRouter;
