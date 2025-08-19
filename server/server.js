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



// Load environment variables before using them
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
await connectDb().catch((err) => console.log(err));
await connectCloudinary().catch((err) => console.log(err));



const allowedOrigin = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is Working");
});

app.use("/api/user", userRouter); // the official path where func userRouter will work
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
