import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { loginSuccess } from "../reducers/authSlice";
import { loginApi } from "../services/authApi";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const isValidEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
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
        <div style={{ background: "#ffffff", height: "calc(100vh - 76px)" }} className="flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Column: Form */}
            <div className="flex-1 flex flex-col justify-between items-center px-6 py-8 sm:px-12 md:px-16 lg:px-20 bg-white overflow-y-auto">
                {/* Back button & join us link */}
                <div className="flex justify-between items-center w-full max-w-[360px] mb-4">
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
                        New here?{" "}
                        <Link to="/signup" className="font-extrabold text-[#e8622a] hover:underline" id="link-to-signup">
                            Join us
                        </Link>
                    </span>
                </div>

                {/* Main Form Box + Footer Group */}
                <div className="w-full max-w-[360px] my-auto flex flex-col gap-6 pt-2">
                    <div>
                        {/* Header */}
                        <div className="mb-8 relative">
                            <h2 className="text-[28px] font-black text-stone-900 tracking-tight leading-none">Sign In</h2>
                            <p className="text-[11px] text-[#8c9ba5] font-semibold mt-1.5">Welcome back to your SHOPx profile</p>
                            {/* Hand-drawn style decorative arrow */}
                            <svg className="absolute right-0 top-1 h-6 w-12 text-[#e8622a]/40 pointer-events-none" fill="none" viewBox="0 0 48 24" stroke="currentColor" strokeWidth="2.5">
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

                        {/* Form Fields */}
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] transition-all duration-300 py-2.5">
                                <svg className="h-5 w-5 text-stone-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    id="email-input"
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

                            {/* Password Input */}
                            <div className="relative flex items-center border-b border-stone-200 focus-within:border-[#e8622a] transition-all duration-300 py-2.5">
                                <svg className="h-5 w-5 text-stone-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent text-sm text-stone-850 placeholder-stone-400 outline-none font-medium"
                                    autoComplete="current-password"
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

                            {/* Submit and Social */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#d94e14] px-8 py-3 text-sm font-extrabold tracking-wider text-white shadow-lg shadow-[#e8622a]/25 hover:shadow-[#e8622a]/45 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                    id="login-submit-btn"
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                    <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>

                                {/* Social Login Buttons */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Or</span>
                                    <button 
                                        type="button" 
                                        className="h-9 w-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-all text-[#1877f2] shadow-sm cursor-pointer"
                                        title="Sign in with Facebook"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                                        </svg>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="h-9 w-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-all shadow-sm cursor-pointer"
                                        title="Sign in with Google"
                                    >
                                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.09-1.34-1.39-2.11z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Language selection footer element */}
                    <div className="w-full flex justify-between items-center text-[11px] font-bold text-[#8c9ba5] select-none pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-600 transition-colors">
                            <span>🇬🇧</span>
                            <span>ENG</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <span className="font-medium text-[10px]">&copy; 2026 SHOPx Inc.</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Premium Royal Blue / Indigo gradient & Showcase graphics */}
            <div className="hidden md:flex flex-1 flex-col justify-center items-center px-12 lg:px-20 text-center relative overflow-visible" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)" }}>
                {/* Custom S-curve wavy SVG divider */}
                <svg 
                    className="absolute top-0 bottom-0 -left-[99px] w-[100px] h-full pointer-events-none hidden md:block" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    style={{ zIndex: 10 }}
                >
                    <defs>
                        <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#3730a3" />
                        </linearGradient>
                    </defs>
                    <path d="M100,0 L50,0 C20,20 0,40 20,60 C35,75 50,85 50,100 L100,100 Z" fill="url(#wave-gradient)" />
                </svg>

                {/* Glowing ambient background lights */}
                <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

                {/* Dashboard Showcase Components Container */}
                <div className="relative w-full max-w-[280px] h-[360px] flex flex-col justify-between items-center z-20">
                    
                    {/* Glassmorphic floating logo 1: Instagram */}
                    <div className="absolute -left-15 top-[12%] h-12 w-12 rounded-full border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md bg-white/10 animate-float pointer-events-none" style={{ animationDuration: '5s' }}>
                        <svg className="h-6 w-6 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                    </div>

                    {/* Glassmorphic floating logo 2: TikTok */}
                    <div className="absolute -right-8 top-[35%] h-12 w-12 rounded-full border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md bg-white/10 animate-float pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1.2s' }}>
                        <svg className="h-6 w-6 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                    </div>

                    {/* Card 1: Inbox statistics with gradient line chart */}
                    <div 
                        className="w-full max-w-[230px] rounded-2xl bg-white p-5 text-left shadow-2xl shadow-indigo-950/20 relative select-none transform -rotate-[3deg] transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer self-start"
                        style={{ boxShadow: "0 20px 45px rgba(0,0,0,0.22)" }}
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#ff723b]">Inbox</p>
                            <h3 className="text-xl font-black text-stone-900 tracking-tight mt-0.5">176,18</h3>
                        </div>
                        
                        {/* Elegant custom line graph */}
                        <div className="h-12 w-full mt-4 relative flex items-end">
                            <svg className="w-full h-full text-indigo-600" viewBox="0 0 100 30" fill="none">
                                <defs>
                                    <linearGradient id="chart-fill-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,25 C15,5 30,22 45,12 C60,2 75,20 90,8 C95,4 100,4 100,4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M0,25 C15,5 30,22 45,12 C60,2 75,20 90,8 C95,4 100,4 100,4 L100,30 L0,30 Z" fill="url(#chart-fill-grad)" />
                            </svg>
                            {/* Floating Graph Marker */}
                            <div className="absolute top-1 left-[43%] h-5.5 w-5.5 rounded-full bg-stone-950 text-white text-[9px] font-black flex items-center justify-center shadow-lg border border-white/20 select-none">
                                45
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Glassmorphic Security Key Card with layout skeleton lines */}
                    <div 
                        className="w-full max-w-[230px] rounded-2xl border border-white/10 p-5 text-left relative overflow-hidden transform rotate-[3deg] transition-all duration-500 hover:rotate-0 hover:scale-105 cursor-pointer flex flex-col gap-3.5 self-end"
                        style={{ 
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-400">
                                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-3.418-4.418A10.05 10.05 0 003 9c0 4.77 3.393 8.94 8 9.94 4.607-1 8-5.17 8-9.94 0-1.258-.234-2.463-.663-3.578M12 9v2m0 4h.01" />
                                </svg>
                            </div>
                            {/* Card Layout lines */}
                            <div className="flex flex-col gap-1.5 w-16 opacity-35 mt-1.5">
                                <div className="h-1 bg-white rounded-full w-full"></div>
                                <div className="h-1 bg-white rounded-full w-[80%]"></div>
                                <div className="h-1 bg-white rounded-full w-[60%]"></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white/90">Your data, your rules.</h4>
                            <p className="text-[10px] text-white/50 leading-relaxed font-semibold mt-1">
                                Your data belongs to you, and our encryption ensures that your shopping history is protected.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
