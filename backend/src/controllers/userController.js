import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { addEmailToQueue } from "../queues/emailQueue.js";
import redis from "../config/redis.js"
import bcrypt from "bcrypt";

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
                role: user.role
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
                role: user.role
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
        const cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

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
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};