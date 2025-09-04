//place order : /api/order/cash-on-delivery

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import { scheduleRatingReminder } from "../services/notificationService.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";
// Helper function to calculate order amount
const calculateOrderAmount = async (items) => {
  const itemPromises = items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    return { product, amount: product.offerPrice * item.quantity };
  });

  const itemResults = await Promise.all(itemPromises);
  const products = itemResults.map(result => result.product);
  let amount = itemResults.reduce((sum, result) => sum + result.amount, 0);
  
  // Add 2% tax
  amount += Math.floor(amount * 0.02);
  
  return { products, amount };
};

export const placeOrderOnline = async (req, res) => {
  try {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, address } = req.body;
    const userId = req.userId;
    const origin = req.headers.origin || process.env.CLIENT_URL;

    if (!userId || !items || items.length === 0 || !address) {
      return sendErrorResponse(res, "Please fill all the fields", 400);
    }

    const { products, amount } = await calculateOrderAmount(items);

    if (isNaN(amount) || amount <= 0) {
      return sendErrorResponse(res, "Invalid order amount calculated", 400);
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

    return sendSuccessResponse(res, {
      url: session.url,
      sessionId: session.id,
    }, "Stripe session created successfully");
  } catch (error) {
    return sendErrorResponse(res, `Failed to create order: ${error.message}`, 500);
  }
};

export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body || {};

    if (!userId || !items || items.length === 0 || !address) {
      return sendErrorResponse(res, "Please fill all the fields", 400);
    }

    const { amount } = await calculateOrderAmount(items);

    if (isNaN(amount) || amount <= 0) {
      return sendErrorResponse(res, "Invalid order amount calculated", 400);
    }

    const newOrder = await Order.create({
      userId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      amount: Number(amount),
      address,
      paymentType: "Cash on Delivery",
    });

    return sendSuccessResponse(res, {
      orderId: newOrder._id,
    }, "Order placed successfully");
  } catch (error) {
    return sendErrorResponse(res, `Failed to create order: ${error.message}`, 500);
  }
};

//get all orders : /api/order/get-all-orders (for users)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

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

    return sendSuccessResponse(res, { orders: transformedOrders }, "Orders retrieved successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
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

    // Transform data to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
    }));

    return sendSuccessResponse(res, { orders: transformedOrders }, "Seller orders retrieved successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

// ✅ Add new function for updating order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return sendErrorResponse(res, "Order ID and status are required", 400);
    }

    // Get the order with populated items and user info before updating
    const orderBeforeUpdate = await Order.findById(orderId)
      .populate('items.productId', 'name')
      .populate('userId', 'name email');

    if (!orderBeforeUpdate) {
      return sendErrorResponse(res, "Order not found", 404);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.productId', 'name')
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

    return sendSuccessResponse(res, { order: updatedOrder }, "Order status updated successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

// Add this new function to orderController.js
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, isPaid } = req.body;

    if (!orderId || typeof isPaid !== "boolean") {
      return sendErrorResponse(res, "Order ID and payment status are required", 400);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { isPaid },
      { new: true }
    );

    if (!updatedOrder) {
      return sendErrorResponse(res, "Order not found", 404);
    }

    return sendSuccessResponse(res, { order: updatedOrder }, "Payment status updated successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message, 500);
  }
};

export const placeOrderGuest = async (req, res) => {
  try {
    const { items, address } = req.body || {};

    if (!items || items.length === 0 || !address) {
      return sendErrorResponse(res, "Please fill all the fields", 400);
    }

    const { amount } = await calculateOrderAmount(items);

    if (isNaN(amount) || amount <= 0) {
      return sendErrorResponse(res, "Invalid order amount calculated", 400);
    }

    const newOrder = await Order.create({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      amount: Number(amount),
      address,
      paymentType: "Cash on Delivery",
    });

    return sendSuccessResponse(res, {
      orderId: newOrder._id,
    }, "Order placed successfully");
  } catch (error) {
    return sendErrorResponse(res, `Failed to create order: ${error.message}`, 500);
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

// Delete order function
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.userId;

    if (!orderId) {
      return sendErrorResponse(res, "Order ID is required", 400);
    }

    // Find the order and populate product details
    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return sendErrorResponse(res, "Order not found", 404);
    }

    // Check if the seller owns any products in this order
    const sellerOwnsProducts = order.items.some(
      (item) => item.productId.sellerId.toString() === sellerId
    );

    if (!sellerOwnsProducts) {
      return sendErrorResponse(res, "You can only delete orders containing your products", 403);
    }

    await Order.findByIdAndDelete(orderId);

    return sendSuccessResponse(res, {}, "Order deleted successfully");
  } catch (error) {
    return sendErrorResponse(res, "Failed to delete order", 500);
  }
};
