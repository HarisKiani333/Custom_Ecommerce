import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: Array,
      required: true,
    },
    // Remove duplicate price field
    offerPrice: {
      type: Number,
      required: true,
    },
    image: {
      type: Array,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      required: true,
    },
    weight: {
      type: String,
      required: true,
      default: "1kg",
      validate: {
        validator: function (v) {
          // Validate weight format (number followed by unit like kg, g, lb, oz)
          return /^\d+(\.\d+)?(kg|g|lb|oz)$/i.test(v);
        },
        message: 'Weight must be in format like "1kg", "500g", "2.5lb", etc.',
      },
    },
  },
  { timestamps: true }
);

// Create composite unique index to prevent same seller from having duplicate product names
productSchema.index({ sellerId: 1, name: 1 }, { unique: true });

// ✅ FIX: Use uppercase 'Product' to match references
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
