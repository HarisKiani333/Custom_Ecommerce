//place order : /api/order/cash-on-delivery

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import { scheduleRatingReminder } from "../services/notificationService.js";
export const placeOrderOnline = async (req, res) => {
  try {
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, address } = req.body;
    const userId = req.userId;
    const origin = req.headers.origin || process.env.CLIENT_URL;

    if (!userId || !items || items.length === 0 || !address) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Calculate total amount
    let amount = 0;
    const products = [];

    const itemPromises = items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      products.push(product);
      return product.offerPrice * item.quantity;
    });

    const itemAmounts = await Promise.all(itemPromises);
    amount = itemAmounts.reduce((sum, itemAmount) => sum + itemAmount, 0);

    // Add 2% tax
    amount += Math.floor(amount * 0.02);

    if (isNaN(amount) || amount <= 0) {
      return res.json({
        success: false,
        message: "Invalid order amount calculated",
      });
    }

    // Create order in DB
    const newOrder = await Order.create({
      userId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe line items from fetched products
    const line_items = items.map((item, idx) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: products[idx].name,
        },
        unit_amount: products[idx].offerPrice * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/loader?next=cart`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
      },
    });

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order: " + error.message,
    });
  }
};

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
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
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
        path: "items.productId",
        model: "Product",
      })
      .populate("address")
      .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      orderDate: order.createdAt.toLocaleDateString(),
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
    // Include both COD and Online orders
    const orders = await Order.find({
      $or: [{ paymentType: "Cash on Delivery" }, { paymentType: "Online" }],
    })
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .populate("address")
      .sort({ createdAt: -1 });

    // ✅ Transform data to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.map((item) => ({
        product: item.productId, // Transform productId to product
        quantity: item.quantity,
      })),
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
        message: "Order ID and status are required",
      });
    }

    // Get the order with populated items and user info before updating
    const orderBeforeUpdate = await Order.findById(orderId)
      .populate('items.product', 'name')
      .populate('userId', 'name email');

    if (!orderBeforeUpdate) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product', 'name')
     .populate('userId', 'name email');

    // Send rating reminder notification if order is delivered/completed and paid
    if ((status === 'Delivered' || status === 'Completed') && 
        updatedOrder.isPaid && 
        updatedOrder.userId) {
      try {
        await scheduleRatingReminder(updatedOrder, updatedOrder.userId);
        console.log(`Rating reminder sent for order ${orderId}`);
      } catch (notificationError) {
        console.error('Failed to send rating reminder:', notificationError);
        // Don't fail the order update if notification fails
      }
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
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

    if (!orderId || typeof isPaid !== "boolean") {
      return res.json({
        success: false,
        message: "Order ID and payment status are required",
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
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment status updated successfully",
      order: updatedOrder,
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid order data" });
    }

    const newOrder = await Order.create({
      items,
      amount,
      guestAddress,
      guestInfo,
      paymentType,
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Stripe webhook handler
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received webhook event: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      
      // Update order payment status
      if (session.metadata && session.metadata.orderId) {
        try {
          const updatedOrder = await Order.findByIdAndUpdate(
            session.metadata.orderId,
            { isPaid: true },
            { new: true }
          );
          
          if (updatedOrder) {
            console.log(`✅ Payment successful for order: ${session.metadata.orderId}`);
            console.log(`Order status updated: isPaid = ${updatedOrder.isPaid}`);
          } else {
            console.error(`❌ Order not found: ${session.metadata.orderId}`);
          }
        } catch (error) {
          console.error('❌ Error updating order payment status:', error);
        }
      } else {
        console.error('❌ No orderId found in session metadata');
      }
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment intent succeeded:', paymentIntent.id);
      
      // Additional handling for payment_intent.succeeded if needed
      // This provides an extra layer of confirmation
      if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
        try {
          const updatedOrder = await Order.findByIdAndUpdate(
            paymentIntent.metadata.orderId,
            { isPaid: true },
            { new: true }
          );
          
          if (updatedOrder) {
            console.log(`✅ Payment intent confirmed for order: ${paymentIntent.metadata.orderId}`);
          }
        } catch (error) {
          console.error('❌ Error updating order from payment intent:', error);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
