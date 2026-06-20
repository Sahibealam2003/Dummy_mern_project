import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { signupSuccess } from "../reducers/authSlice";
import { signupApi, verifyOtpApi } from "../services/authApi";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    // OTP verification state
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isValidEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    // Live Password Strength Criteria Checks
    const checkLength = password.length >= 6;
    const checkNumOrSymbol = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
    const checkUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const isPasswordValid = checkLength && checkNumOrSymbol && checkUpperLower;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!isPasswordValid) {
            setError("Please fulfill all password requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("phoneNumber", phoneNumber);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const data = await signupApi(formData);

            if (data.success) {
                setSuccessMessage("Account created! Verification code sent to email.");
                setIsOtpStep(true);
            } else {
                setError(data.error || "Signup failed.");
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            const data = await verifyOtpApi(email, otp);
            if (data.success) {
                dispatch(signupSuccess(data.user));
                setSuccessMessage("Email verified successfully! Redirecting...");
                setTimeout(() => navigate(redirectUrl), 1200);
            } else {
                setError(data.error || "OTP verification failed.");
            }
        } catch (err) {
            console.error("OTP Verification error:", err);
            setError(err.response?.data?.error || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#ffffff", height: "calc(100vh - 76px)" }} className="flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Column: Form */}
            <div className="flex-1 flex flex-col justify-between items-center px-6 py-4 sm:px-12 md:px-16 lg:px-20 bg-white overflow-y-auto">
                {/* Back button & sign-in redirect */}
                <div className="flex justify-between items-center w-full max-w-[360px] mb-1">
                    <Link 
                        to={redirectUrl} 
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
                        id="back-home-btn"
                    >
                        <svg className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <span className="text-xs text-[#8c9ba5] font-semibold">
                        Already member?{" "}
                        <Link to="/login" className="font-extrabold text-[#e8622a] hover:underline" id="link-to-login">
                            Sign in
                        </Link>
                    </span>
                </div>

                {/* Main Content Box + Footer Group */}
                <div className="w-full max-w-[360px] my-auto flex flex-col gap-5 pt-2">
                    <div className="py-2">
                    {/* Header */}
                    <div className="mb-3 relative">
                        <h2 className="text-[26px] font-black text-stone-900 tracking-tight leading-none">
                            {isOtpStep ? "Verify OTP" : "Sign Up"}
                        </h2>
                        <p className="text-[12px] text-[#8c9ba5] font-semibold mt-1">
                            {isOtpStep ? "Verify email to activate your account" : "Secure your SHOPx exclusive member profile"}
                        </p>
                        {/* Hand-drawn style decorative arrow */}
                        <svg className="absolute right-0 top-0.5 h-5 w-10 text-[#e8622a]/40 pointer-events-none" fill="none" viewBox="0 0 48 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M40,4 C28,4 20,8 16,16 M16,16 L12,12 M16,16 L22,14" />
                        </svg>
                    </div>

                    {/* Alert Banners */}
                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 animate-shake">
                            <span className="inline-flex items-center gap-1.5">
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {error}
                            </span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                            <span className="inline-flex items-center gap-1.5">
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {successMessage}
                            </span>
                        </div>
                    )}

                    {isOtpStep ? (
                        /* OTP Verification View */
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="text-xs text-[#8c9ba5] leading-relaxed font-semibold">
                                We sent a 6-digit verification code to <span className="font-extrabold text-stone-850">{email}</span>. Please enter it below.
                            </div>
                            
                            {/* Visual 6-Digit Box Grid with Hidden Native Input */}
                            <div className="relative cursor-pointer my-4">
                                <input
                                    id="otp-input"
                                    type="text"
                                    value={otp}
                                    maxLength={6}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    autoComplete="one-time-code"
                                    required
                                    autoFocus
                                />
                                <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                                    {[...Array(6)].map((_, index) => {
                                        const char = otp[index] || "";
                                        const isFocused = otp.length === index;
                                        return (
                                            <div 
                                                key={index} 
                                                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-base font-black transition-all ${
                                                    isFocused 
                                                        ? "border-[#e8622a] bg-[#e8622a]/5 shadow-sm shadow-[#e8622a]/15 text-[#e8622a]" 
                                                        : char 
                                                            ? "border-stone-400 bg-stone-50 text-stone-900" 
                                                            : "border-stone-200 bg-stone-50/50 text-stone-400"
                                                }`}
                                            >
                                                {char}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOtpStep(false)}
                                    className="text-xs font-bold text-[#8c9ba5] hover:text-[#e8622a] transition-colors cursor-pointer"
                                >
                                    &larr; Edit Details
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#d94e14] px-7 py-2.5 text-xs font-extrabold tracking-wider text-white shadow-lg shadow-[#e8622a]/25 hover:shadow-[#e8622a]/45 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                >
                                    {loading ? "Verifying..." : "Verify Code"}
                                    <svg className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Signup Form View */
                        <form onSubmit={handleFormSubmit} className="space-y-2.5">
                            {/* Avatar Picker */}
                            <div className="flex items-center gap-3.5 py-0.5 mb-3">
                                <div className="relative group shrink-0">
                                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center transition-all duration-300 group-hover:border-[#e8622a] relative">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="h-full w-full object-cover" alt="avatar preview" />
                                        ) : (
                                            <svg className="h-4.5 w-4.5 text-stone-400 group-hover:text-[#e8622a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 h-4.5 w-4.5 bg-[#e8622a] rounded-full border border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-sm">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <span className="text-[10px] text-white font-extrabold leading-none">+</span>
                                    </label>
                                </div>
                                <div className="flex flex-col text-left select-none">
                                    <span className="text-[10px] text-stone-900 uppercase tracking-widest font-black leading-tight">Profile Picture</span>
                                    <span className="text-[9px] text-[#8c9ba5] font-semibold leading-tight">Optional image (max 2MB)</span>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] text-stone-400 focus-within:text-[#e8622a] transition-all duration-300 py-1.5">
                                <svg className="h-4.5 w-4.5 mr-2.5 shrink-0 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    id="name-input"
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="name"
                                    required
                                />
                                {name.trim().length >= 3 && (
                                    <svg className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] text-stone-400 focus-within:text-[#e8622a] transition-all duration-300 py-1.5">
                                <svg className="h-4.5 w-4.5 mr-2.5 shrink-0 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <input
                                    id="phone-input"
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="tel"
                                    required
                                />
                                {phoneNumber.trim().length >= 8 && (
                                    <svg className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            {/* Email Address */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] text-stone-400 focus-within:text-[#e8622a] transition-all duration-300 py-1.5">
                                <svg className="h-4.5 w-4.5 mr-2.5 shrink-0 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    id="email-input"
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="email"
                                    required
                                />
                                {isValidEmail(email) && (
                                    <svg className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            {/* Password */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] text-stone-400 focus-within:text-[#e8622a] transition-all duration-300 py-1.5">
                                <svg className="h-4.5 w-4.5 mr-2.5 shrink-0 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="new-password"
                                    required
                                />
                                {isPasswordValid && (
                                    <svg className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-stone-400 hover:text-stone-600 transition-colors ml-2 focus:outline-none cursor-pointer"
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 113.682 3.682m0 0l3.99 3.99m-2.122-2.122L17 17m-2-2l2-2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Dynamic Password Strength Feedback Checklist */}
                            {password.length > 0 && (
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] font-bold text-stone-400 select-none py-0.5 px-0.5 justify-start">
                                    <span className={`inline-flex items-center gap-1 transition-colors duration-300 ${checkLength ? "text-emerald-600" : "text-stone-400"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${checkLength ? "bg-emerald-500" : "bg-stone-300"}`} />
                                        Min 6 chars
                                    </span>
                                    <span className={`inline-flex items-center gap-1 transition-colors duration-300 ${checkNumOrSymbol ? "text-emerald-600" : "text-stone-400"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${checkNumOrSymbol ? "bg-emerald-500" : "bg-stone-300"}`} />
                                        Number / Symbol
                                    </span>
                                    <span className={`inline-flex items-center gap-1 transition-colors duration-300 ${checkUpperLower ? "text-emerald-600" : "text-stone-400"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${checkUpperLower ? "bg-emerald-500" : "bg-stone-300"}`} />
                                        Letter Mix (A-a)
                                    </span>
                                </div>
                            )}

                            {/* Confirm Password */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] text-stone-400 focus-within:text-[#e8622a] transition-all duration-300 py-1.5">
                                <svg className="h-4.5 w-4.5 mr-2.5 shrink-0 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    id="confirm-password-input"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-Type Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="new-password"
                                    required
                                />
                                {confirmPassword.length >= 6 && confirmPassword === password && (
                                    <svg className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-stone-400 hover:text-stone-600 transition-colors ml-2 focus:outline-none cursor-pointer"
                                    tabIndex="-1"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 113.682 3.682m0 0l3.99 3.99m-2.122-2.122L17 17m-2-2l2-2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Submit and Social */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#d94e14] px-6 py-2.5 text-[13px] font-extrabold tracking-wider text-white shadow-lg shadow-[#e8622a]/25 hover:shadow-[#e8622a]/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                    id="signup-submit-btn"
                                >
                                    {loading ? "Signing Up..." : "Sign Up"}
                                    <svg className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                
                                {/* Social Login Buttons */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Or</span>
                                    <button 
                                        type="button" 
                                        className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-all text-[#1877f2] shadow-sm cursor-pointer"
                                        title="Sign up with Facebook"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                                        </svg>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-all shadow-sm cursor-pointer"
                                        title="Sign up with Google"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.09-1.34-1.39-2.11z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                    </div>

                    {/* Language selection footer element */}
                    <div className="w-full flex justify-between items-center text-[11px] font-bold text-[#8c9ba5] select-none pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-600 transition-colors">
                            <span>🇬🇧</span>
                            <span>ENG</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <span className="font-medium text-[10px]">&copy; 2026 SHOPx Inc.</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Premium Warm Bronze / Chocolate gradient & Showcase graphics */}
            <div className="hidden md:flex flex-1 flex-col justify-center items-center px-12 lg:px-20 text-center relative overflow-visible" style={{ background: "linear-gradient(135deg, #2b1f1d 0%, #130c0a 100%)" }}>
                {/* Custom S-curve wavy SVG divider */}
                <svg 
                    className="absolute top-0 bottom-0 -left-[99px] w-[100px] h-full pointer-events-none hidden md:block" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    style={{ zIndex: 10 }}
                >
                    <defs>
                        <linearGradient id="wave-gradient-signup" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#2b1f1d" />
                            <stop offset="100%" stopColor="#130c0a" />
                        </linearGradient>
                    </defs>
                    <path d="M100,0 L50,0 C20,20 0,40 20,60 C35,75 50,85 50,100 L100,100 Z" fill="url(#wave-gradient-signup)" />
                </svg>

                {/* Glowing ambient background lights */}
                <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#e8622a]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

                {/* Dashboard Showcase Components Container */}
                <div className="relative w-full max-w-[280px] h-[360px] flex flex-col justify-between items-center z-25">
                    
                    {/* Glassmorphic floating logo 1: Shopping Bag */}
                    <div className="absolute -left-15 top-[12%] h-12 w-12 rounded-full border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md bg-white/10 animate-float pointer-events-none" style={{ animationDuration: '5s' }}>
                        <svg className="h-5.5 w-5.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                    </div>

                    {/* Glassmorphic floating logo 2: Discount Tag */}
                    <div className="absolute -right-8 top-[35%] h-12 w-12 rounded-full border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md bg-white/10 animate-float pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1.2s' }}>
                        <svg className="h-5.5 w-5.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Card 1: VIP Club Reward coupon card */}
                    <div 
                        className="w-full max-w-[230px] rounded-2xl bg-gradient-to-br from-amber-400 to-[#e8622a] p-5 text-left shadow-2xl relative select-none transform -rotate-[3deg] transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer self-start"
                        style={{ boxShadow: "0 20px 45px rgba(0,0,0,0.3)" }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-stone-900/60">VIP Club Reward</p>
                                <h3 className="text-lg font-black text-stone-950 tracking-tight mt-0.5">30% OFF</h3>
                            </div>
                            <svg className="h-6 w-6 text-stone-950/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1" />
                            </svg>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-stone-950/10 flex justify-between items-center">
                            <span className="text-[9px] bg-stone-950 text-amber-400 px-2 py-0.5 rounded-full font-black tracking-wider uppercase">NEWUSER30</span>
                            <span className="text-[8px] text-stone-950/70 font-bold">Welcome Gift</span>
                        </div>
                    </div>

                    {/* Card 2: Glassmorphic Package Delivery/Shipment tracker card */}
                    <div 
                        className="w-full max-w-[230px] rounded-2xl border border-white/10 p-5 text-left relative overflow-hidden transform rotate-[3deg] transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer flex flex-col gap-3.5 self-end"
                        style={{ 
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center text-orange-400">
                                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between text-[9px] font-black text-white/70">
                                <span>Shipping Activity</span>
                                <span className="text-orange-400">Arriving Today</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full mt-0.5">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-white/90">Track packages instantly.</h4>
                            <p className="text-[10px] text-white/50 leading-relaxed font-semibold mt-1">
                                Real-time updates, easy return policies, and secure checkout protections.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
