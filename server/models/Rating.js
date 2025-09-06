import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v >= 1 && v <= 5;
        },
        message: "Rating must be an integer between 1 and 5",
      },
    },
    review: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate ratings per user-product combination
ratingSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Create index for efficient product rating queries
ratingSchema.index({ productId: 1 });

const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

export default Rating;
