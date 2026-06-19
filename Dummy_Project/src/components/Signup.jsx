import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { signupSuccess } from "../reducers/authSlice";
import { signupApi, verifyOtpApi } from "../services/authApi";

const FIELD_CLS = "w-full rounded-xl border border-[#e8e3dc] bg-white px-3.5 py-2.5 text-xs text-[#2c2420] placeholder-[#a69c93] outline-none focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all duration-300 shadow-sm hover:border-[#d4c9be]";
const LABEL_CLS = "block text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] mb-1.5";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    // OTP verification state
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState("");

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
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
        <div style={{ background: "#ffffff", height: "calc(100vh - 104px)" }} className="flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 bg-[#faf8f5]/50 backdrop-blur-lg overflow-hidden">
                <div className="w-full max-w-[370px]">
                    {/* Logo & Welcome text */}
                    <div className="mb-4">
                        <div className="flex items-center gap-0.5 select-none mb-1">
                            <span className="text-xl font-black tracking-tight" style={{ color: "#2c2420" }}>SHOP</span>
                            <span className="text-xl font-black tracking-tight" style={{ color: "#e8622a" }}>x</span>
                        </div>
                        <p className="text-[10px] text-[#8c7e74] font-extrabold uppercase tracking-wider">
                            {isOtpStep ? "Verify email !!!" : "Start your journey !!!"}
                        </p>
                        <h2 className="text-2xl font-black text-[#2c2420] tracking-tight mt-0.5">
                            {isOtpStep ? "Enter OTP" : "Sign up"}
                        </h2>
                    </div>

                    {/* Alert Banners */}
                    {error && (
                        <div className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-semibold text-rose-600 animate-shake">
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {error}
                            </span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                            ✓ {successMessage}
                        </div>
                    )}

                    {/* Form Layout */}
                    {isOtpStep ? (
                        /* OTP Verification Form */
                        <form onSubmit={handleOtpSubmit} className="space-y-3">
                            <div className="text-xs text-[#8c7e74] leading-relaxed mb-1">
                                We sent a 6-digit verification code to <span className="font-semibold text-[#2c2420]">{email}</span>.
                            </div>
                            <div>
                                <label className={LABEL_CLS}>6-Digit OTP</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    maxLength={6}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className={`${FIELD_CLS} text-center text-sm tracking-widest font-bold`}
                                    autoComplete="one-time-code"
                                    required
                                />
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsOtpStep(false)}
                                    className="text-xs font-bold text-[#8c7e74] hover:text-[#e8622a] transition-colors cursor-pointer"
                                >
                                    &larr; Back to edit
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 hover:opacity-95 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                >
                                    {loading ? "Verifying..." : "Verify Code"} &rarr;
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Signup Form */
                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            {/* Avatar Uploader preview */}
                            <div className="flex items-center gap-3.5 py-1">
                                <div className="relative group shrink-0">
                                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-dashed border-[#d4c9be] bg-white flex items-center justify-center transition-all duration-200 group-hover:border-[#e8622a] relative shadow-sm">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="h-full w-full object-cover" alt="avatar preview" />
                                        ) : (
                                            <svg className="h-5 w-5 text-[#a69c93] group-hover:text-[#e8622a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 h-4.5 w-4.5 bg-[#e8622a] rounded-full border border-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <span className="text-[9px] text-white font-bold">+</span>
                                    </label>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] text-[#2c2420] uppercase tracking-wider font-extrabold leading-tight">Profile Picture</span>
                                    <span className="text-[9px] text-[#8c7e74] leading-tight">Optional photo upload</span>
                                </div>
                            </div>

                            {/* 2-Column Grid for Name and Phone */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLS}>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={FIELD_CLS}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 555-0199"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={FIELD_CLS}
                                        autoComplete="tel"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 2-Column Grid for Email and Password */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLS}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={FIELD_CLS}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={FIELD_CLS}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[11px] text-[#8c7e74]">
                                    Already registered?{" "}
                                    <Link
                                        to="/login"
                                        className="font-bold text-[#e8622a] hover:underline cursor-pointer"
                                    >
                                        Sign in
                                    </Link>
                                </span>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 hover:opacity-95 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                >
                                    {loading ? "Signing Up..." : "Sign Up"} &rarr;
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Column: Premium Dark Chocolate & Gold VIP membership showcase */}
            <div className="hidden md:flex flex-1 flex-col justify-center items-center px-12 lg:px-20 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1c1815 0%, #110e0c 100%)" }}>
                {/* Glowing ambient lights */}
                <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#e8622a]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#c44e1e]/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

                <div className="max-w-md w-full relative z-10 flex flex-col items-center">
                    {/* Floating Holographic VIP Card */}
                    <div 
                        className="w-full max-w-[300px] aspect-[1.58/1] rounded-2xl border border-white/10 p-5 text-left relative overflow-hidden mb-8 transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer shadow-[0_20px_50px_rgba(232,98,42,0.15)] flex flex-col justify-between"
                        style={{ 
                            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                            backdropFilter: "blur(20px)",
                            transform: "rotate(-4deg) translateY(-10px)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#e8622a]">SHOPx MEMBERSHIP</p>
                                <h3 className="text-base font-black text-white/90 tracking-tight mt-0.5">VIP Gold</h3>
                            </div>
                            <svg className="h-5 w-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        {/* Card Chip */}
                        <div className="w-8 h-6 rounded bg-gradient-to-br from-[#ffd700]/70 to-[#b8860b]/70 border border-white/10 shadow-inner flex items-center justify-center">
                            <div className="w-5.5 h-3 border border-black/10 rounded-sm opacity-50" />
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[8px] text-white/40 tracking-wider font-semibold uppercase">Card Holder</p>
                                <p className="text-[11px] text-white/90 font-bold uppercase tracking-wide mt-0.5">VIP Member</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-white/40 tracking-wider font-semibold uppercase">Valid Thru</p>
                                <p className="text-[11px] text-white/90 font-bold tracking-wide mt-0.5">06 / 31</p>
                            </div>
                        </div>
                    </div>

                    <span className="rounded-full bg-[#e8622a]/10 px-4 py-1.5 text-[10px] font-bold tracking-wider text-[#e8622a] uppercase border border-[#e8622a]/20">
                        Exclusive Members Club
                    </span>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight mt-5">
                        Shop Smarter.<br />Live Better.
                    </h2>
                    <p className="mt-4 text-xs text-white/60 leading-relaxed max-w-xs">
                        Unlock a personalized shopping universe with instant checkouts, dedicated premium support, early drops, and members-only pricing.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
