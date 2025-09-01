import express from "express";
import {
  placeOrderCOD,
  getSellerOrders,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  placeOrderGuest,
  placeOrderOnline,
  stripeWebhook,
  deleteOrder,
} from "../controllers/orderController.js";
import { authUser } from "../middleware/authUser.js";
import authSeller from "../middleware/authSeller.js";

const orderRouter = express.Router();

orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/seller", authSeller, getSellerOrders);
orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.put("/update-status", authSeller, updateOrderStatus);
orderRouter.put("/update-payment", authSeller, updatePaymentStatus);
orderRouter.post("/guest", placeOrderGuest);
orderRouter.post("/online", authUser, placeOrderOnline);
// Stripe webhook route (raw middleware handled in server.js)
orderRouter.post("/stripe-webhook", stripeWebhook);
// Delete order route (seller only)
orderRouter.delete("/delete/:orderId", authSeller, deleteOrder);

export default orderRouter;
