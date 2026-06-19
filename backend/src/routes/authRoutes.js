import express from "express";
import { signup, verifyOTP, login, logout } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/signup", upload.single("avatar"), signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);

export default router;