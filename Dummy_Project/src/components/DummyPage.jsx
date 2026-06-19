import React from "react";
import { useNavigate } from "react-router-dom";

const DummyPage = ({ title, description }) => {
    const navigate = useNavigate();

    return (
        <div
            className="flex min-h-[calc(100vh-90px)] items-center justify-center px-4 py-4 sm:px-6 lg:px-8"
            style={{ background: "#f5f3ef" }}
        >
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#ede8e2] bg-white p-8 text-center shadow-xl md:p-12">
                {/* Background decorative blob */}
                <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#e8622a]/5 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#e8622a]/5 blur-3xl" />

                {/* Animated graphic wrapper */}
                <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff3ed] to-[#ffe5d9] text-[#e8622a] shadow-inner">
                    <svg
                        className="h-10 w-10 animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                </div>

                {/* Tag */}
                <span className="inline-block rounded-full bg-[#fff3ed] border border-[#e8622a]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#e8622a] mb-3">
                    Under Development
                </span>

                {/* Main Content */}
                <h1 className="text-3xl font-black tracking-tight text-[#2c2420] sm:text-4xl">
                    {title}
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8c7e74]">
                    {description || "We are currently designing and building this section of our store to bring you the best possible shopping experience. Please check back later!"}
                </p>

                {/* Features placeholder list */}
                <div className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2 text-left">
                    {[
                        "Modern UI Design",
                        "Seamless Integration",
                        "Real-time Updates",
                        "Secure checkout",
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl border border-[#ede8e2] bg-[#fdfbf9] px-3.5 py-2.5 transition-all hover:bg-[#fffcfb] hover:border-[#e8622a]/20">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <span className="text-xs font-bold text-[#5a4e46]">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="btn-glow inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#e8622a]/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DummyPage;
