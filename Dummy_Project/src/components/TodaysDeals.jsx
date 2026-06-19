import React from "react";
import { Link } from "react-router-dom";

const TodaysDeals = () => {
    return (
        <div className="mx-auto max-w-2xl w-full px-4 py-4 text-center animate-fade-in-up">
            <div className="relative overflow-hidden rounded-3xl border border-[#ede8e2] bg-white p-8 md:p-12 shadow-sm">
                {/* Decorative warm background blobs */}
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#fff3ed]/50 blur-2xl" />
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-100/30 blur-2xl" />

                {/* Clock / Tag Icon */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3ed] text-3xl shadow-sm shadow-[#e8622a]/10 mb-6">
                    <svg className="h-8 w-8 text-[#e8622a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-[#2c2420] sm:text-3xl">
                    Today's Deals
                </h1>

                <p className="mt-4 text-base font-semibold text-[#e8622a]">
                    There is no deals today
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[#8c7e74] max-w-sm mx-auto">
                    Our current batch of daily discount offers has ended. Check back tomorrow morning for fresh limited-time deals!
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        to="/"
                        className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#2c2420] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#3d3028]"
                    >
                        <span className="inline-flex items-center gap-1.5"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> Return to Home</span>
                    </Link>
                    <Link
                        to="/"
                        className="btn-glow inline-flex items-center gap-2 rounded-xl border border-[#ede8e2] bg-white px-6 py-3 text-sm font-bold text-[#2c2420] hover:bg-[#fdf9f5]"
                    >
                        Browse All Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TodaysDeals;
