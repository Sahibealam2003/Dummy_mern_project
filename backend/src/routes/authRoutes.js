import express from "express";
import { 
    signup, 
    verifyOTP, 
    login, 
    logout, 
    getTempUsers, 
    updateProfile, 
    toggleWishlist, 
    getWishlist, 
    forgotPassword,
    saveToken,
    getAllUsersForAdmin,
    updateUserRole,
    deleteUserByAdmin,
    sendBroadcastEmail,
    sendCRMNotification
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", upload.single("avatar"), signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/test-otps", getTempUsers);
router.put("/update-profile", protect, upload.single("avatar"), updateProfile);


router.post("/forgot-password", forgotPassword);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.post("/save-token",protect,saveToken);

// CRM admin routes
router.get("/admin/users", protect, admin, getAllUsersForAdmin);
router.put("/admin/users/:id/role", protect, admin, updateUserRole);
router.delete("/admin/users/:id", protect, admin, deleteUserByAdmin);
router.post("/admin/users/broadcast-email", protect, admin, sendBroadcastEmail);
router.post("/admin/users/send-notification", protect, admin, sendCRMNotification);

export default router;