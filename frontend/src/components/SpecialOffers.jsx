import React, { useState, useEffect } from "react";
import { getAllSpecialOffers } from "../services/api";

const COUPONS = [
    {
        code: "NEWUSER20",
        discount: "20% OFF",
        title: "Welcome Discount",
        desc: "Valid on your first purchase. No minimum order value.",
        expiry: "Expires Jul 31, 2026",
        tag: "WELCOME DEAL",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>,
        color: "#e8622a",
        bg: "#fff3ed"
    },
    {
        code: "SHOP10",
        discount: "10% OFF",
        title: "Site-wide Promotion",
        desc: "Save 10% on orders above $49 across all categories.",
        expiry: "Expires Dec 31, 2026",
        tag: "SITE-WIDE",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>,
        color: "#e8622a",
        bg: "#fff3ed"
    },
    {
        code: "FREESHIP",
        discount: "FREE SHIPPING",
        title: "Standard Delivery",
        desc: "Get free standard shipping on orders above $25.",
        expiry: "Expires Oct 15, 2026",
        tag: "SHIPPING",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>,
        color: "#2c7a4a",
        bg: "#f0fdf4"
    },
    {
        code: "ELECTRO15",
        discount: "15% OFF",
        title: "Electronics Event",
        desc: "Valid on all computers, smartphones, and accessories.",
        expiry: "Expires Jun 30, 2026",
        tag: "CATEGORY DEAL",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
        color: "#2563eb",
        bg: "#eff6ff"
    },
    {
        code: "FASHION30",
        discount: "30% OFF",
        title: "Summer Collection",
        desc: "Save big on selected clothing and apparel.",
        expiry: "Expires Jun 25, 2026",
        tag: "FLASH SALE",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 5 7 8c0 2 1 3.5 2.5 4.5L8 22h8l-1.5-9.5C16 11.5 17 10 17 8c0-3-2-6-5-6z"/></svg>,
        color: "#db2777",
        bg: "#fdf2f8"
    },
    {
        code: "CASHBACK5",
        discount: "5% CASHBACK",
        title: "Payment Reward",
        desc: "Get 5% cashback instantly when paying via card.",
        expiry: "Expires Aug 12, 2026",
        tag: "CARD PROMO",
        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
        color: "#7c3aed",
        bg: "#f5f3ff"
    }
];

const CouponCard = ({ coupon }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-[#ede8e2] bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group">
            {/* Ticket side cutouts */}
            <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 h-5 w-5 rounded-full border-r border-[#ede8e2] bg-[#f5f3ef]" />
            <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 h-5 w-5 rounded-full border-l border-[#ede8e2] bg-[#f5f3ef]" />

            {/* Header info */}
            <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <span
                        className="rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide"
                        style={{ color: coupon.color, background: coupon.bg }}
                    >
                        {coupon.tag}
                    </span>
                    <span className="leading-none flex items-center justify-center h-5 w-5" style={{ color: coupon.color }}>
                        {typeof coupon.icon === "string" && coupon.icon.trim().startsWith("<svg") ? (
                            <span className="h-5 w-5 inline-block" dangerouslySetInnerHTML={{ __html: coupon.icon }} />
                        ) : (
                            coupon.icon || (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            )
                        )}
                    </span>
                </div>

                <h3 className="text-lg font-black tracking-tight text-[#2c2420]" style={{ color: coupon.color }}>
                    {coupon.discount}
                </h3>
                <h4 className="text-sm font-bold text-[#2c2420] mt-1">
                    {coupon.title}
                </h4>
                <p className="text-xs text-[#8c7e74] mt-1.5 leading-relaxed">
                    {coupon.desc}
                </p>
            </div>

            {/* Footer code action */}
            <div className="border-t border-dashed border-[#ede8e2] p-4 bg-[#fdfbf9] flex items-center justify-between gap-3 rounded-b-2xl">
                <div className="min-w-0">
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase tracking-wider">Coupon Code</p>
                    <p className="text-sm font-mono font-extrabold text-[#2c2420] mt-0.5 truncate select-all">
                        {coupon.code}
                    </p>
                </div>

                <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
                    style={{
                        background: copied ? "#2c7a4a" : "#2c2420",
                        color: "#ffffff"
                    }}
                >
                    {copied ? (
                        <span>✓ Copied!</span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M4 4l1-1h5.414L14 6.586V14l-1 1H5l-1-1V4zm9 3l-3-3H5v10h8V7z" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M3 1L2 2v10l1 1V2h6.414l-1-1H3z" />
                            </svg>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

const SpecialOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await getAllSpecialOffers();
                setOffers(data);
            } catch (err) {
                console.error("Failed to load special offers:", err);
                setOffers(COUPONS);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold" style={{ color: "#2c2420" }}>
                        <span className="inline-flex items-center gap-2"><svg className="h-5 w-5 text-[#e8622a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg> Special Offers & Coupons</span>
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "#8c7e74" }}>
                        Click to copy our exclusive discount codes and save big at checkout!
                    </p>
                </div>

                {/* Divider */}
                <div className="mb-8 h-px" style={{ background: "#ede8e2" }} />

                {/* Coupon Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton h-48 w-full rounded-2xl border border-[#ede8e2]" />
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                        <p className="text-sm font-semibold text-[#8c7e74]">No active special offers available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger animate-fade-in">
                        {offers.map((coupon) => (
                            <CouponCard key={coupon.code} coupon={coupon} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecialOffers;
