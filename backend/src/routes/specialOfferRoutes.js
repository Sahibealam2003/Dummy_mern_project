import express from "express";
import {
    getSpecialOffers,
    createSpecialOffer,
    updateSpecialOffer,
    deleteSpecialOffer
} from "../controllers/specialOfferController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getSpecialOffers);
router.post("/", protect, admin, createSpecialOffer);
router.put("/:id", protect, admin, updateSpecialOffer);
router.delete("/:id", protect, admin, deleteSpecialOffer);

export default router;
