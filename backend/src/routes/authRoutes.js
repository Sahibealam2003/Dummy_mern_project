import express from "express";
import { signup, verifyOTP, login, logout, getTempUsers, updateProfile } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", upload.single("avatar"), signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);
router.get("/test-otps", getTempUsers);
router.put("/update-profile", protect, upload.single("avatar"), updateProfile);

export default router;