import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import redis from "../config/redis.js";

export const protect = async (req, res, next) => {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Not authorized, please login again" });
    }

    try {
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: "Session invalidated, please login again" });
        }
    } catch (redisError) {
        console.error("Redis blacklist check error:", redisError);
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

export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Admins only" });
    }
};
