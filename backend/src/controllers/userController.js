import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { addEmailToQueue } from "../queues/emailQueue.js";
import redis from "../config/redis.js"
import bcrypt from "bcrypt";
import crypto from "crypto";

const tempUsers = new Map();

export const signup = async (req, res) => {

    try {

        const { 
            name, 
            email, 
            password, 
            phoneNumber, 
            avatar,
            role
        } = req.body;


        if (!name || !email || !password || !phoneNumber) {
            console.log("Signup Validation Failed: Missing required fields:", {
                name: !name,
                email: !email,
                password: !password,
                phoneNumber: !phoneNumber
            });
            return res.status(400).json({
                error: "All fields are required"
            });
        }
 

        const existingUser = await User.findOne({ email });


        if (existingUser) {
            console.log("Signup Validation Failed: Email is already registered:", email);
            return res.status(400).json({
                error: "User already exists"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        );

        // Upload avatar image to Cloudinary if file exists in request
        let avatarUrl = "";
        if (req.file) {
            try {
                avatarUrl = await uploadToCloudinary(req.file.buffer);
            } catch (cloudinaryError) {
                console.log("Cloudinary upload failed:", cloudinaryError);
                return res.status(500).json({
                    error: "Failed to upload avatar image"
                });
            }
        } else {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8622a&color=fff&bold=true`;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const lowerCaseEmail = email.toLowerCase();
        const tempUserKey = `temp_user:${lowerCaseEmail}`;
        await redis.set(
            tempUserKey,
            JSON.stringify({
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                avatar: avatarUrl,
                role: role || "user",
                otp: otp.toString(),
                expireAt: Date.now() + 10 * 60 * 1000
            }),
            "EX",
            600
        );
        console.log("store in redis");

        // Reset verification attempts
        await redis.del(`otp_attempts:${lowerCaseEmail}`);
        await redis.del(`otp_blocked:${lowerCaseEmail}`);

        try {
            const message = `Welcome to our platform! Your email verification OTP is ${otp}. It is valid for 10 minutes.`;
            await sendEmail({
                email: email.toLowerCase(),
                subject: "Verify your email - OTP",
                message
            });
            console.log("OTP sent");
        } catch (emailError) {
            console.log("Error sending verification email:", emailError);
        }

        res.status(201).json({

            success:true,

            message:
            "User created. Please verify your email",
        });


    } catch (error) {

        console.log("Error in signup:", error);

        res.status(500).json({
            error:"Internal server error"
        });

    }

};

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const lowerCaseEmail = email.toLowerCase();
        const blockedKey = `login_blocked:${lowerCaseEmail}`;
        const attemptsKey = `login_attempts:${lowerCaseEmail}`;

        const isBlocked = await redis.get(blockedKey);
        if (isBlocked) {
            return res.status(429).json({
                error: "Too many failed login attempts. Please try again after 5 minutes."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                error: "Email is not verified"
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            const attempts = await redis.incr(attemptsKey);

            if (attempts === 1) {
                await redis.expire(attemptsKey, 600);
            }

            if (attempts >= 3) {
                await redis.set(blockedKey, "true", "EX", 300);
                await redis.del(attemptsKey);
                return res.status(429).json({
                    error: "You have exceeded 3 incorrect login attempts. Blocked for 5 minutes."
                });
            }

            return res.status(401).json({
                error: `Invalid password. You have ${3 - attempts} attempts left.`
            });
        }

        
        await redis.del(attemptsKey);
        await redis.del(blockedKey);

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "7d" }
        );

        const cookieOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        try {
            await addEmailToQueue({
                email: user.email,
                subject: "Login Alert - Successful Login",
                message: `Hi ${user.name},\n\nYou have successfully logged into your account on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}.\n\nIf this wasn't you, please secure your account immediately.\n\nBest regards,\nSupport Team`
            });
        } catch (emailError) {
            console.log("Error sending login alert email:", emailError);
        }

        res.status(200).cookie("token", token, cookieOptions).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isVerified: user.isVerified,
                role: user.role,
                wishlist: user.wishlist || []
            }
        });

    } catch (error) {
        console.log("Error in login:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                error: "Email and OTP are required"
            });
        }

        const lowerCaseEmail = email.toLowerCase();
        const blockedKey = `otp_blocked:${lowerCaseEmail}`;
        const attemptsKey = `otp_attempts:${lowerCaseEmail}`;
        const tempUserKey = `temp_user:${lowerCaseEmail}`;

        // checked blocked user
        const isBlocked = await redis.get(blockedKey);
        if (isBlocked) {
            return res.status(429).json({
                error: "Too many failed attempts. Please try again after 5 minutes."
            });
        }

        const userData = await redis.get(tempUserKey);
        if (!userData) {
            return res.status(400).json({
                error: "Verification session expired or not found. Please sign up again."
            });
        }

        const tempData = JSON.parse(userData);

        // OTP verification validation
        if (tempData.otp !== otp.toString()) {
            const attempts = await redis.incr(attemptsKey);

            if (attempts === 1) {
                await redis.expire(attemptsKey, 600);
            }

       //rate limiting
            if (attempts >= 3) {
                await redis.set(blockedKey, "true", "EX", 300);
                await redis.del(attemptsKey);
                return res.status(429).json({
                    error: "You have exceeded 3 incorrect attempts. Blocked for 5 minutes."
                });
            }

            return res.status(400).json({
                error: `Invalid OTP. You have ${3 - attempts} attempts left.`
            });
        }

        // res
        const user = await User.create({
            name: tempData.name,
            email: tempData.email,
            password: tempData.password,
            phoneNumber: tempData.phoneNumber,
            avatar: tempData.avatar,
            role: tempData.role || "user",
            isVerified: true
        });

        // Redis keys cleanup
        await redis.del(tempUserKey);
        await redis.del(attemptsKey);
        await redis.del(blockedKey);
        console.log("OTP verify");

        // Welcome Email send alert queue
        try {
            await addEmailToQueue({
                email: user.email,
                subject: "Welcome to Our Platform!",
                message: `Hi ${user.name},\n\nWelcome! Your account verified successfully.\n\nBest regards,\nSupport Team`
            });
        } catch (emailError) {
            console.log("Error sending welcome email:", emailError);
        }

        // JWT token generate
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "7d" }
        );

        const cookieOptions = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        res.status(200).cookie("token", token, cookieOptions).json({
            success: true,
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isVerified: user.isVerified,
                role: user.role,
                wishlist: user.wishlist || []
            }
        });

    } catch (error) {
        console.log("Error in verifyOTP:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const logout = async (req, res) => {
    try {
        const user = req.user;
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        // Clear cookie options
        const cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        // Blacklist token in Redis if valid
        if (token) {
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.exp) {
                    const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
                    if (remainingSeconds > 0) {
                        await redis.set(`blacklist:${token}`, "true", "EX", remainingSeconds);
                        console.log(`Token blacklisted in Redis for ${remainingSeconds} seconds`);
                    }
                }
            } catch (redisError) {
                console.error("Redis token blacklisting error:", redisError);
            }
        }

        // Logout email notification disabled as requested
        /*
        if (user) {
            try {
                await addEmailToQueue({
                    email: user.email,
                    subject: "Account Logout Notification",
                    message: `Hi ${user.name},\n\nYou have successfully logged out of your account on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}.\n\nIf you did not perform this logout, please secure your account immediately.\n\nBest regards,\nSupport Team`
                });
            } catch (queueError) {
                console.log("Error queuing logout email:", queueError);
            }
        }
        */

        res.status(200).cookie("token", null, cookieOptions).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.log("Error in logout:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const getTempUsers = (req, res) => {
    const list = Array.from(tempUsers.entries()).map(([email, data]) => ({
        email,
        otp: data.otp,
        expireAt: data.expireAt
    }));
    res.json(list);
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phoneNumber, role } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (name) user.name = name.trim();
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
        if (role !== undefined) user.role = role;

        if (req.file) {
            try {
                const avatarUrl = await uploadToCloudinary(req.file.buffer);
                user.avatar = avatarUrl;
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed in updateProfile:", cloudinaryError);
                return res.status(500).json({ error: "Failed to upload avatar image" });
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isVerified: user.isVerified,
                role: user.role,
                wishlist: user.wishlist || []
            }
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Toggle wishlist status for a product (customers only)
export const toggleWishlist = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a wishlist" });
        }

        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            // Remove product from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Removed from wishlist",
                wishlist: user.wishlist
            });
        } else {
            // Add product to wishlist
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Added to wishlist",
                wishlist: user.wishlist
            });
        }
    } catch (error) {
        console.error("Error in toggleWishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get populated user wishlist (customers only)
export const getWishlist = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a wishlist" });
        }

        const user = await User.findById(req.user._id).populate("wishlist");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Filter out any deleted products if they still exist in the wishlist array
        const activeWishlist = user.wishlist.filter(item => item !== null);

        res.status(200).json(activeWishlist);
    } catch (error) {
        console.error("Error in getWishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Request password reset link (forgot password)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Secure response: don't reveal if email exists, or reveal it?
            // Usually we return a message indicating if the email exists it was sent, but the user requested:
            // "Reset password request route banayein jisme user apna email daale."
            // "We have emailed your password reset link!" is nice.
            // Let's return 404/invalid email for better UI feedback, or return success to prevent user enumeration?
            // "Login rate limiting: 3 failed login attempts blocks email for 5 minutes".
            // Let's return 404 if user not found, so they know they entered the wrong email. E-commerce platforms often say "User not found" to help real customers who mistyped. Let's return 404.
            return res.status(404).json({ error: "No user found with that email address" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash and set reset fields
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();

        // Queue reset email
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        const emailMessage = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

        try {
            await addEmailToQueue({
                email: user.email,
                subject: "Password Reset Request",
                message: emailMessage
            });
            console.log(`Password reset email queued for ${user.email}`);
        } catch (queueErr) {
            console.error("Failed to queue password reset email:", queueErr);
            // Rollback DB changes if queue fails
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;
            await user.save();
            return res.status(500).json({ error: "Failed to queue reset email. Please try again later." });
        }

        res.status(200).json({
            success: true,
            message: "We have emailed your password reset link!"
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }

        // Update password and clear reset token fields
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};