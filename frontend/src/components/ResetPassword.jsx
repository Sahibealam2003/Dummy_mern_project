import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPasswordApi } from "../services/authApi";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const data = await resetPasswordApi(token, password);
            if (data.success) {
                setSuccessMessage("Password updated successfully! Redirecting to login...");
                setPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.error || "Failed to reset password.");
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setError(
                err.response?.data?.error || 
                "Reset token is invalid or has expired. Please request another one."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#ffffff", height: "calc(100vh - 76px)" }} className="flex justify-center items-center px-4 font-sans bg-stone-50">
            {/* Center Box Card */}
            <div className="w-full max-w-[420px] bg-white rounded-xl border border-stone-100 p-8 sm:p-10 shadow-2xl shadow-stone-200/50 relative overflow-hidden">
                {/* Decorative Ambient Background Light */}
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#e8622a]/10 to-transparent blur-2xl pointer-events-none" />

                {/* Back link */}
                <div className="flex justify-between items-center w-full mb-6">
                    <Link 
                        to="/login" 
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
                        id="reset-back-btn"
                        title="Back to login"
                    >
                        <svg className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <span className="text-xs text-[#8c9ba5] font-semibold">
                        Back to{" "}
                        <Link to="/login" className="font-extrabold text-[#e8622a] hover:underline">
                            Login
                        </Link>
                    </span>
                </div>

                {/* Title Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">Reset Password</h2>
                    <p className="text-[12px] text-[#8c9ba5] font-semibold mt-2.5 leading-relaxed">
                        Please set your new password below. Make sure it is at least 6 characters.
                    </p>
                </div>

                {/* Alert Banners */}
                {error && (
                    <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                        <span className="inline-flex items-center gap-1.5">
                            <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-semibold text-emerald-700">
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
                    {/* Password Input */}
                    <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] transition-all duration-300 py-2.5">
                        <svg className="h-5 w-5 text-stone-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            id="reset-password-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent text-sm text-stone-850 placeholder-stone-400 outline-none font-medium"
                            required
                        />
                        {password.length >= 6 && (
                            <svg className="h-5 w-5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 113.682 3.682m0 0l3.99 3.99m-2.122-2.122L17 17m-2-2l2-2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] transition-all duration-300 py-2.5">
                        <svg className="h-5 w-5 text-stone-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            id="reset-confirm-password-input"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent text-sm text-stone-850 placeholder-stone-400 outline-none font-medium"
                            required
                        />
                        {confirmPassword.length >= 6 && password === confirmPassword && (
                            <svg className="h-5 w-5 text-emerald-500 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 113.682 3.682m0 0l3.99 3.99m-2.122-2.122L17 17m-2-2l2-2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                            className="group w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e8622a] to-[#d94e14] py-3.5 text-sm font-extrabold tracking-wider text-white shadow-lg shadow-[#e8622a]/25 hover:shadow-[#e8622a]/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            id="reset-submit-btn"
                        >
                            {loading ? "Updating password..." : "Reset Password"}
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

export default ResetPassword;
