import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// ✅ FIX: Use uppercase 'Product' to match references
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
