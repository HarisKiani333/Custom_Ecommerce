//place order : /api/order/cash-on-delivery

import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body || {};

    if (!userId || !items || items.length === 0 || !address) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // ✅ FIX: Use Promise.all with map instead of async reduce
    let amount = 0;

    // Calculate total amount for all items
    const itemPromises = items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      return product.offerPrice * item.quantity;
    });

    try {
      const itemAmounts = await Promise.all(itemPromises);
      amount = itemAmounts.reduce((sum, itemAmount) => sum + itemAmount, 0);
    } catch (error) {
      return res.json({
        success: false,
        message: error.message || "Product validation failed",
      });
    }

    // Adding 2% tax
    amount += Math.floor(amount * 0.02);

    // ✅ Ensure amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      return res.json({
        success: false,
        message: "Invalid order amount calculated",
      });
    }

    const newOrder = await Order.create({
      userId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      amount: Number(amount), // Explicitly convert to number
      address,
      paymentType: "Cash on Delivery",
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order: " + error.message,
    });
  }
};

//get all orders : /api/order/get-all-orders (for users)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // ✅ comes from middleware

    const orders = await Order.find({ userId })
      .populate({
        path: 'items.productId',
        model: 'Product'
      })
      .populate('address')
      .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.map(item => ({
        product: item.productId,
        quantity: item.quantity
      })),
      orderDate: order.createdAt.toLocaleDateString()
    }));

    return res.json({ success: true, orders: transformedOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// for seller
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "Cash on Delivery" }],
    })
      .populate({
        path: 'items.productId', // ✅ Fix: Use productId instead of product
        model: 'Product'
      })
      .populate('address')
      .sort({ createdAt: -1 });

    // ✅ Transform data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.map(item => ({
        product: item.productId, // Transform productId to product
        quantity: item.quantity
      }))
    }));

    return res.json({ success: true, orders: transformedOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Add new function for updating order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add this new function to orderController.js
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, isPaid } = req.body;
    
    if (!orderId || typeof isPaid !== 'boolean') {
      return res.json({
        success: false,
        message: "Order ID and payment status are required"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { isPaid },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      message: "Payment status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const placeOrderGuest = async (req, res) => {
  try {
    const { items, amount, guestAddress, guestInfo, paymentType } = req.body;

    if (!items?.length || !guestAddress || !guestInfo) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const newOrder = await Order.create({
      items,
      amount,
      guestAddress,
      guestInfo,
      paymentType,
    });

    res.json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};