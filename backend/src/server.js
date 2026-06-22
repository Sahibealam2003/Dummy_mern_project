import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import specialOfferRoutes from "./routes/specialOfferRoutes.js";
import { seedProducts } from "./controllers/productController.js";
import { seedSpecialOffers } from "./controllers/specialOfferController.js";
import "./queues/emailWorker.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/special-offers", specialOfferRoutes);

connectDB().then(() => {
    seedProducts();
    seedSpecialOffers();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});