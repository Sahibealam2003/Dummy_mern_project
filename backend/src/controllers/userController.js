import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// Temporary unverified user signup cache
const tempUsers = new Map();

export const signup = async (req, res) => {

    try {

        const { 
            name, 
            email, 
            password, 
            phoneNumber, 
            avatar 
        } = req.body;


        console.log("Signup Request Received. Body:", {
            name: req.body?.name,
            email: req.body?.email,
            password: req.body?.password ? "[HIDDEN]" : undefined,
            phoneNumber: req.body?.phoneNumber,
            avatar: req.body?.avatar
        });

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
            // Generate initials avatar URL if no avatar file was uploaded
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8622a&color=fff&bold=true`;
        }

        // Store unverified data in memory map
        tempUsers.set(email.toLowerCase(), {
            name,
            email: email.toLowerCase(),
            password,
            phoneNumber,
            avatar: avatarUrl,
            otp: otp.toString(),
            expireAt: Date.now() + 10 * 60 * 1000
        });

        try {
            const message = `Welcome to our platform! Your email verification OTP is ${otp}. It is valid for 10 minutes.`;
            await sendEmail({
                email: email.toLowerCase(),
                subject: "Verify your email - OTP",
                message
            });
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
            return res.status(401).json({
                error: "Invalid password"
            });
        }

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
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isVerified: user.isVerified
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

        const tempData = tempUsers.get(email.toLowerCase());

        if (!tempData) {
            return res.status(400).json({
                error: "Verification session not found. Please sign up again."
            });
        }

        if (tempData.expireAt < Date.now()) {
            tempUsers.delete(email.toLowerCase());
            return res.status(400).json({
                error: "Verification session expired. Please sign up again."
            });
        }

        if (tempData.otp !== otp.toString()) {
            return res.status(400).json({
                error: "Invalid OTP"
            });
        }

        // Save verified user to MongoDB
        const user = await User.create({
            name: tempData.name,
            email: tempData.email,
            password: tempData.password,
            phoneNumber: tempData.phoneNumber,
            avatar: tempData.avatar,
            isVerified: true
        });

        // Delete unverified signup cache
        tempUsers.delete(email.toLowerCase());

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
                isVerified: user.isVerified
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
        const cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

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
};