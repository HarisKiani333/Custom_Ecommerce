import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./configs/db.js";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import ratingRouter from "./routes/ratingRoute.js";
import orderRatingRouter from "./routes/orderRatingRoute.js";
import contactRouter from "./routes/contactRoute.js";
import { logApiRequest } from "./utils/errorLogger.js";

// Load environment variables before using them
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
await connectDb().catch((err) => console.log(err));
await connectCloudinary().catch((err) => console.log(err));

// Stripe webhook route MUST be before express.json() middleware
app.use("/api/order/stripe-webhook", express.raw({type: 'application/json'}));

// 🔴 CRITICAL: Add these missing middleware lines
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from requests

// Add API request logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(logApiRequest);
}

// Enhanced CORS configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  })
);

app.get("/", (req, res) => {
  res.send("API is Working");
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/order-rating", orderRatingRouter);
app.use("/api/contact", contactRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
