import mongoose from "mongoose";

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // not required for guest
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },

    // For logged-in users only
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: function () {
        return !!this.userId; // required only if userId exists
      },
    },

    // For guests only
    guestAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },

    status: {
      type: String,
      default: "Order Placed",
    },
    paymentType: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
