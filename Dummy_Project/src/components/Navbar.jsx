import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../reducers/authSlice";
import { logoutApi } from "../services/authApi";
import ProfileModal from "./ProfileModal";

const PROMOS = [
    <span key="p0" className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>
        New Year Sale — upto 70% OFF on Electronics
    </span>,
    <span key="p1" className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
        Free Shipping on orders above $49
    </span>,
    <span key="p2" className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        Extra 10% OFF with code SHOP10
    </span>,
    <span key="p3" className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
        Buy 2 Get 1 Free on Fashion &amp; Clothing
    </span>,
];

const Navbar = ({ onCartOpen }) => {
    const dispatch = useDispatch();
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [scrolled, setScrolled] = useState(false);
    const [promoIdx, setPromoIdx] = useState(0);
    const [promoVisible, setPromoVisible] = useState(true);
    const totalItems = useSelector((state) => state.cart.totalCount);
    const location = useLocation();
    const currentPath = location.pathname;
    const nav = useNavigate();

    /* close dropdown on click outside */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* scroll shadow */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* rotating promo ticker */
    useEffect(() => {
        const t = setInterval(() => {
            setPromoVisible(false);
            setTimeout(() => {
                setPromoIdx(i => (i + 1) % PROMOS.length);
                setPromoVisible(true);
            }, 350);
        }, 3200);
        return () => clearInterval(t);
    }, []);

    const navItems = [
        { label: "Home", to: "/", active: currentPath === "/" },
        { label: "Today's Deal", to: "/todays-deals", active: currentPath === "/todays-deals", badge: "HOT" },
        { label: "Trending Products", to: "/trending-products", active: currentPath === "/trending-products", badge: null },
        { label: "Special Offers", to: "/special-offers", active: currentPath === "/special-offers", badge: "NEW" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}
            style={{ background: "#ffffff" }}
        >
            {/* ── Announcement ticker ── */}
            <div
                className="flex items-center justify-center gap-3 py-1.5 text-xs font-semibold"
                style={{ background: "#2c2420", color: "#f5f3ef" }}
            >
                <span
                    className="transition-opacity duration-300"
                    style={{ opacity: promoVisible ? 1 : 0 }}
                >
                    {PROMOS[promoIdx]}
                </span>
            </div>

            {/* ── Main row ── */}
            <div
                className="mx-auto flex h-12 max-w-7xl items-center gap-8 px-4 sm:px-6"
                style={{ borderBottom: "1px solid #ede8e2" }}
            >
                {/* Logo */}
                <Link to="/" className="flex shrink-0 items-center gap-0.5 select-none">
                    <span className="text-2xl font-black tracking-tight" style={{ color: "#2c2420" }}>SHOP</span>
                    <span className="text-2xl font-black tracking-tight" style={{ color: "#e8622a" }}>x</span>
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map(({ label, to, active, badge }) => {
                        const isHash = to === "#";
                        const Component = isHash ? "a" : Link;
                        return (
                            <Component
                                key={label}
                                to={isHash ? undefined : to}
                                href={isHash ? "#" : undefined}
                                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
                                style={{
                                    color: active ? "#e8622a" : "#5a4e46",
                                    background: active ? "#fff3ed" : "transparent",
                                }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f7f4f0"; e.currentTarget.style.color = "#2c2420"; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5a4e46"; } }}
                            >
                                {label}
                                {badge && (
                                    <span
                                        className="rounded px-1 py-0.5 text-[8px] font-extrabold tracking-wider text-white"
                                        style={{ background: badge === "HOT" ? "#e8622a" : "#10b981", lineHeight: 1 }}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </Component>
                        );
                    })}
                </nav>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-2">

                    {/* Promo badge */}
                    <div
                        onClick={() => nav('/special-offers')}
                        className="hidden lg:flex items-center gap-2 rounded-xl border px-3 py-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:bg-orange-50/50"
                        style={{ borderColor: "#f9cbb3", background: "#fff8f5" }}
                    >
                        <svg className="h-4 w-4 shrink-0 text-[#e8622a]" fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="M412.7,134.4H229.6c-2,0-3.9,0.8-5.3,2.2l-27.8,27.8L169.1,137c-1.4-1.4-3.3-2.2-5.3-2.2H99.3c-4.1,0-7.5,3.4-7.5,7.5v227.4c0,4.1,3.4,7.5,7.5,7.5h64.5c2,0,3.9-0.8,5.3-2.2l27.4-27.4l27.8,27.8c1.4,1.4,3.3,2.2,5.3,2.2h183.1c4.1,0,7.5-3.4,7.5-7.5V141.9C420.2,137.7,416.8,134.4,412.7,134.4z M405.2,362.6H232.7l-30.9-30.9c-2.9-2.9-7.7-2.9-10.6,0l-30.5,30.5h-53.9V149.8h53.9l30.5,30.5c2.9,2.9,7.7,2.9,10.6,0l30.9-30.9h172.5V362.6z"/><path d="M276.9,235.2c15.4,0,28-12.6,28-28s-12.6-28-28-28s-28,12.6-28,28S261.4,235.2,276.9,235.2z M276.9,194.2c7.2,0,13,5.8,13,13s-5.8,13-13,13s-13-5.8-13-13S269.7,194.2,276.9,194.2z"/><path d="M360,262.4c-15.4,0-28,12.6-28,28s12.6,28,28,28s28-12.6,28-28S375.4,262.4,360,262.4z M360,303.4c-7.2,0-13-5.8-13-13s5.8-13,13-13s13,5.8,13,13S367.2,303.4,360,303.4z"/><path d="M256.6,310.7c1.5,1.5,3.4,2.2,5.3,2.2s3.8-0.7,5.3-2.2l113.1-113.1c2.9-2.9,2.9-7.7,0-10.6c-2.9-2.9-7.7-2.9-10.6,0L256.6,300.1C253.6,303,253.6,307.7,256.6,310.7z"/></g></svg>
                        <p className="text-[11px] font-extrabold tracking-wide whitespace-nowrap" style={{ color: "#2c2420" }}>Use Code <span style={{ color: "#e8622a" }}>SHOP10</span></p>
                        <span
                            className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                            style={{ background: "#e8622a" }}
                        >
                            10% OFF
                        </span>
                    </div>

                    {/* Cart */}
                    <button
                        id="open-cart-btn"
                        onClick={onCartOpen}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-orange-50"
                        aria-label="Open cart"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style={{ color: "#2c2420" }}>
                            <path fillRule="evenodd" d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z M7.11287151,13 L16.7694281,13 C16.9028277,12.9273528 17.0065461,12.8077563 17.0587744,12.6622214 L17.1075574,12.548839 C17.131074,12.5023208 17.131074,12.5023208 17.2371473,12.2923487 C17.3785994,12.0122452 17.3785994,12.0122452 17.5790088,11.6150733 C17.9326498,10.9140516 18.2862826,10.2118596 18.6162844,9.55492931 L18.6307708,9.52609021 C19.2088812,8.37515943 19.6504574,7.49032194 19.8933745,6.9949252 L6.01025746,6.00073455 L6.99015389,12.8600168 C6.99973088,12.9277585 7.0486615,12.9821505 7.11287151,13 Z M16,20 C16.5522847,20 17,19.5522847 17,19 C17,18.4477153 16.5522847,18 16,18 C15.4477153,18 15,18.4477153 15,19 C15,19.5522847 15.4477153,20 16,20 Z M8,20 C8.55228475,20 9,19.5522847 9,19 C9,18.4477153 8.55228475,18 8,18 C7.44771525,18 7,18.4477153 7,19 C7,19.5522847 7.44771525,20 8,20 Z" />
                        </svg>
                        {totalItems > 0 && (
                            <span
                                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                style={{ background: "#e8622a" }}
                            >
                                {totalItems > 99 ? "99+" : totalItems}
                            </span>
                        )}
                    </button>

                    {/* Wishlist */}
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-orange-50">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "#2c2420" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* User Profile / Auth Button */}
                    <div className="relative" ref={dropdownRef}>
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-stone-50 cursor-pointer"
                                    style={{ borderColor: "#d4c9be", color: "#2c2420" }}
                                >
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            className="h-6 w-6 rounded-full object-cover border border-[#e4dfd9]"
                                            alt="avatar"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white uppercase"
                                            style={{ background: "#e8622a" }}
                                        >
                                            {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "U"}
                                        </div>
                                    )}
                                    <span className="hidden sm:inline text-xs truncate max-w-[80px]">
                                        {user?.name?.split(" ")[0]}
                                    </span>
                                    <svg className={`h-3 w-3 text-[#8c7e74] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#ede8e2] bg-white p-2.5 shadow-xl animate-scale-in"
                                        style={{ zIndex: 100 }}
                                    >
                                        <div className="px-3 py-2 border-b border-[#f5f3ef] mb-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {user?.avatar && (
                                                    <img
                                                        src={user.avatar}
                                                        className="h-7 w-7 rounded-full object-cover border border-[#e4dfd9]"
                                                        alt="avatar"
                                                    />
                                                )}
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-[#2c2420] truncate">{user?.name}</p>
                                                    <p className="text-[9px] text-[#8c7e74] truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setProfileOpen(true);
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#5a4e46] transition-colors hover:bg-stone-50 cursor-pointer"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            My Profile
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await logoutApi();
                                                } catch (e) {
                                                    console.error("Backend logout error:", e);
                                                }
                                                dispatch(logout());
                                                setDropdownOpen(false);
                                                nav("/");
                                            }}
                                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-stone-50 cursor-pointer"
                                    style={{ borderColor: "#d4c9be", color: "#2c2420" }}
                                >
                                    <div
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#8c7e74] bg-[#f5f3ef]"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className="hidden sm:inline text-xs">Sign In</span>
                                    <svg className={`h-3 w-3 text-[#8c7e74] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#ede8e2] bg-white p-4 shadow-xl animate-scale-in"
                                        style={{ zIndex: 100 }}
                                    >
                                        <p className="text-xs font-black text-[#2c2420] mb-1">Welcome to SHOPx</p>
                                        <p className="text-[10px] text-[#8c7e74] leading-normal mb-3">Sign in to track orders, access sales, and get members-only pricing.</p>
                                        
                                        <Link 
                                            to="/login" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="block text-center rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-[#e8622a]/15 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                        >
                                            Sign In
                                        </Link>
                                        
                                        <div className="h-px bg-[#f5f3ef] my-3" />
                                        
                                        <div className="text-center">
                                            <span className="text-[10px] text-[#8c7e74]">New member? </span>
                                            <Link 
                                                to="/signup" 
                                                onClick={() => setDropdownOpen(false)}
                                                className="text-[10px] font-bold text-[#e8622a] hover:underline cursor-pointer"
                                            >
                                                Create Account
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
        </header>
    );
};

export default Navbar;
