import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Not authorized, please login again" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(404).json({ error: "User not found" });
        }
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ error: "Session expired or invalid token, please login again" });
    }
};
