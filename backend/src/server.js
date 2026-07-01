import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import specialOfferRoutes from "./routes/specialOfferRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { seedProducts } from "./controllers/productController.js";
import { seedSpecialOffers } from "./controllers/specialOfferController.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import "./queues/emailWorker.js";
import http from "http";

const app = express();
const PORT = process.env.PORT || 8080;

const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/$/, "")
  : null;
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

const server = http.createServer(app)




app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live on Render",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/special-offers", specialOfferRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

connectDB().then(() => {
  seedProducts();
  seedSpecialOffers();
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
