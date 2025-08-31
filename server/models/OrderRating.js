import mongoose from "mongoose";

const orderRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 1 && v <= 5;
        },
        message: 'Overall rating must be an integer between 1 and 5'
      }
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Delivery rating must be an integer between 1 and 5'
      }
    },
    packagingRating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Packaging rating must be an integer between 1 and 5'
      }
    },
    customerServiceRating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5);
        },
        message: 'Customer service rating must be an integer between 1 and 5'
      }
    },
    review: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    wouldRecommend: {
      type: Boolean,
      default: null,
    },
    tags: [{
      type: String,
      enum: [
        'fast-delivery',
        'excellent-packaging',
        'great-communication',
        'easy-ordering',
        'good-value',
        'quality-products',
        'prompt-support',
        'smooth-checkout',
        'timely-updates'
      ]
    }]
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate ratings per user-order combination
orderRatingSchema.index({ userId: 1, orderId: 1 }, { unique: true });

// Create index for efficient order rating queries
orderRatingSchema.index({ orderId: 1 });
orderRatingSchema.index({ userId: 1 });

const OrderRating = mongoose.models.OrderRating || mongoose.model("OrderRating", orderRatingSchema);

export default OrderRating;