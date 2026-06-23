import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../services/authApi";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const isValidEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            const data = await forgotPasswordApi(email);
            if (data.success) {
                setSuccessMessage(data.message || "We have emailed your password reset link!");
                setEmail(""); // clear input
            } else {
                setError(data.error || "Failed to process request.");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(
                err.response?.data?.error || 
                "Something went wrong. Please check your email and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#ffffff", height: "calc(100vh - 76px)" }} className="flex justify-center items-center px-4 font-sans bg-stone-50">
            {/* Center Box Card */}
            <div className="w-full max-w-[420px] bg-white rounded-3xl border border-stone-100 p-8 sm:p-10 shadow-2xl shadow-stone-200/50 relative overflow-hidden">
                {/* Decorative Ambient Background Light */}
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#e8622a]/10 to-transparent blur-2xl pointer-events-none" />

                {/* Back button */}
                <div className="flex justify-between items-center w-full mb-6">
                    <Link 
                        to="/login" 
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
                        id="forgot-back-btn"
                        title="Back to login"
                    >
                        <svg className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <span className="text-xs text-[#8c9ba5] font-semibold">
                        Remember password?{" "}
                        <Link to="/login" className="font-extrabold text-[#e8622a] hover:underline">
                            Login
                        </Link>
                    </span>
                </div>

                {/* Title Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">Forgot Password?</h2>
                    <p className="text-[12px] text-[#8c9ba5] font-semibold mt-2.5 leading-relaxed">
                        Enter your registered email address and we'll send you a secure link to reset your password.
                    </p>
                </div>

                {/* Alert Banners */}
                {error && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                        <span className="inline-flex items-center gap-1.5">
                            <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-semibold text-emerald-700">
                        <span className="inline-flex items-center gap-2">
                            <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{successMessage}</span>
                        </span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] transition-all duration-300 py-3">
                        <svg className="h-5 w-5 text-stone-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input
                            id="forgot-email-input"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent text-sm text-stone-850 placeholder-stone-400 outline-none font-medium"
                            autoComplete="email"
                            required
                        />
                        {isValidEmail(email) && (
                            <svg className="h-5 w-5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !isValidEmail(email)}
                            className="group w-full flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#d94e14] py-3.5 text-sm font-extrabold tracking-wider text-white shadow-lg shadow-[#e8622a]/25 hover:shadow-[#e8622a]/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            id="forgot-submit-btn"
                        >
                            {loading ? "Sending link..." : "Send Reset Link"}
                            <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* Footer Brand Info */}
                <div className="w-full text-center text-[10px] font-bold text-[#8c9ba5] select-none mt-8 pt-4 border-t border-stone-100">
                    &copy; 2026 SHOPx Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
