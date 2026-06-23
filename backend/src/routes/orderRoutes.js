import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);


router.get("/all/list", protect, admin, getAllOrders); 
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
