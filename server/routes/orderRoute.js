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
// Add webhook route (must be before express.json() middleware)
orderRouter.post("/stripe-webhook", express.raw({type: 'application/json'}), stripeWebhook);

export default orderRouter;
