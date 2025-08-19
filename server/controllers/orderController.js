//place order : /api/order/cash-on-delivery

import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!userId || items.length === 0 || !address) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      return (await acc) + product.OfferPrice * item.quantity;
    }, 0);

    //adding 2% tax
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Cash on Delivery",
    });

    return res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get all orders : /api/order/get-all-orders (for users)
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "Cash on Delivery" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// for seller
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "Cash on Delivery" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
