import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { loginSuccess } from "../reducers/authSlice";
import { loginApi } from "../services/authApi";

const FIELD_CLS = "w-full rounded-xl border border-[#e8e3dc] bg-white px-3.5 py-2.5 text-xs text-[#2c2420] placeholder-[#a69c93] outline-none focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all duration-300 shadow-sm hover:border-[#d4c9be]";
const LABEL_CLS = "block text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] mb-1.5";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            // Login flow using MERN API
            const data = await loginApi(email, password);
            
            if (data.success) {
                dispatch(loginSuccess(data.user));
                setSuccessMessage("Logged in successfully! Redirecting...");
                setTimeout(() => navigate(redirectUrl), 1200);
            } else {
                setError(data.error || "Login failed.");
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#ffffff", height: "calc(100vh - 104px)" }} className="flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 bg-[#faf8f5]/50 backdrop-blur-lg overflow-hidden">
                <div className="w-full max-w-[360px]">
                    {/* Logo & Welcome text */}
                    <div className="mb-4">
                        <div className="flex items-center gap-0.5 select-none mb-1">
                            <span className="text-xl font-black tracking-tight" style={{ color: "#2c2420" }}>SHOP</span>
                            <span className="text-xl font-black tracking-tight" style={{ color: "#e8622a" }}>x</span>
                        </div>
                        <p className="text-[10px] text-[#8c7e74] font-extrabold uppercase tracking-wider">
                            Welcome back !!!
                        </p>
                        <h2 className="text-2xl font-black text-[#2c2420] tracking-tight mt-0.5">
                            Sign in
                        </h2>
                    </div>

                    {/* Alert Banners */}
                    {error && (
                        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-600 animate-shake">
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg> 
                                {error}
                            </span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">
                            ✓ {successMessage}
                        </div>
                    )}

                    {/* Form Layout */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">
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
                            <div className="flex justify-between items-center mb-1">
                                <label className={LABEL_CLS}>Password</label>
                                <a href="#" className="text-[10px] text-[#8c7e74]/80 hover:text-[#e8622a] transition-colors font-bold uppercase tracking-wider">
                                    Forgot Password?
                                </a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={FIELD_CLS}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[11px] text-[#8c7e74]">
                                New to SHOPx?{" "}
                                <Link
                                    to="/signup"
                                    className="font-bold text-[#e8622a] hover:underline cursor-pointer"
                                >
                                    Sign up
                                </Link>
                            </span>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 hover:opacity-95 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {loading ? "Signing In..." : "Sign In"} &rarr;
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Premium Dark Slate & Silver/Teal payment card showcase */}
            <div className="hidden md:flex flex-1 flex-col justify-center items-center px-12 lg:px-20 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #131722 0%, #0c0e14 100%)" }}>
                {/* Glowing ambient lights */}
                <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

                <div className="max-w-md w-full relative z-10 flex flex-col items-center">
                    {/* Floating Holographic Silver Card */}
                    <div 
                        className="w-full max-w-[300px] aspect-[1.58/1] rounded-2xl border border-white/10 p-5 text-left relative overflow-hidden mb-8 transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer shadow-[0_20px_50px_rgba(16,185,129,0.1)] flex flex-col justify-between"
                        style={{ 
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                            backdropFilter: "blur(20px)",
                            transform: "rotate(4deg) translateY(-10px)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0,0,0,0.6)"
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">SHOPx EXPRESS PAY</p>
                                <h3 className="text-base font-black text-white/90 tracking-tight mt-0.5">Platinum</h3>
                            </div>
                            <svg className="h-5 w-5 text-emerald-400/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>

                        {/* Card Chip */}
                        <div className="w-8 h-6 rounded bg-gradient-to-br from-stone-300 to-stone-500 border border-white/10 shadow-inner flex items-center justify-center">
                            <div className="w-5.5 h-3 border border-black/10 rounded-sm opacity-50" />
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[8px] text-white/40 tracking-wider font-semibold uppercase">Authorized User</p>
                                <p className="text-[11px] text-white/90 font-bold uppercase tracking-wide mt-0.5">VIP Member</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-white/40 tracking-wider font-semibold uppercase">Secured Status</p>
                                <p className="text-[11px] text-emerald-400 font-bold tracking-wide mt-0.5 flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase border border-emerald-500/20">
                        Secure Express Pay
                    </span>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight mt-5">
                        Fast. Secure.<br />Seamless.
                    </h2>
                    <p className="mt-4 text-xs text-white/60 leading-relaxed max-w-xs">
                        Sign in to access your saved payment methods, check delivery status in real-time, and check out with single-click simplicity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
