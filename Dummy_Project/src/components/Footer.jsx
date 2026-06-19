import { NavLink } from "react-router-dom";
import { useState } from "react";
const YEAR = new Date().getFullYear();

const links = {
    Product: [
        { name: "All Products", path: "/products" },
        { name: "Add Product", path: "/add-product" },
        { name: "Categories", path: "/categories" },
        { name: "Featured", path: "/featured" },
    ],

    Company: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Blog", path: "/blog" },
        { name: "Press Kit", path: "/press-kit" },
    ],

    Support: [
        { name: "Documentation", path: "/documentation" },
        { name: "Help Center", path: "/help-center" },
        { name: "Contact Us", path: "/contact" },
        { name: "Status", path: "/status" },
    ],

    Legal: [
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Cookie Policy", path: "/cookie-policy" },
        { name: "Licenses", path: "/licenses" },
    ],
};
const socials = [
    {
        label: "GitHub",
        href: "#",
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.021C22 6.484 17.522 2 12 2z" />
            </svg>
        ),
    },
    {
        label: "Twitter / X",
        href: "#",
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "#",
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: "Discord",
        href: "#",
        icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
        ),
    },
];

const Footer = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubscribe = (e) => {
        e.preventDefault();

        if (!email) {
            setMessage("Please enter your email");
            return;
        }


        // Backend API yaha call kar sakte ho
        console.log("Subscribed Email:", email);


        setMessage("Successfully subscribed!");
        setEmail("");


        setTimeout(() => {
            setMessage("");
        }, 3000);
    };
    return (
        <footer className="relative mt-24 border-t border-[#ede8e2] bg-[#fdfbf9]">
            {/* Top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-[#e8622a]/30 to-transparent" />

            {/* Newsletter strip */}
            <div className="border-b border-[#ede8e2] py-10">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <div>
                            <h3 className="text-lg font-bold text-[#2c2420]">Stay in the loop</h3>
                            <p className="text-sm text-[#8c7e74] mt-0.5">Get notified about new products and platform updates.</p>
                        </div>
                        <form
                            onSubmit={handleSubscribe}
                            className="flex w-full max-w-sm gap-2"
                        >

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email..."
                                className="flex-1 rounded-xl border border-[#e4dfd9] bg-[#fafafa] px-4 py-2 text-sm text-[#2c2420] placeholder-[#a69c93] outline-none focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all"
                            />


                            <button
                                type="submit"
                                className="btn-glow rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 cursor-pointer"
                            >
                                Subscribe
                            </button>

                        </form>


                        {
                            message && (
                                <p className="mt-2 text-sm text-[#e8622a]">
                                    {message}
                                </p>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Main links grid */}
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">

                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-lg shadow-lg shadow-[#e8622a]/20">
                                <svg
                                    className="h-4 w-4 text-white"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z"
                                    />
                                </svg>
                            </div>
                            <span className="text-lg font-extrabold tracking-tight" style={{ color: "#2c2420" }}>SHOP<span className="text-lg font-extrabold tracking-tight" style={{ color: "#e8622a" }}>x</span></span>

                        </div>
                        <p className="text-sm leading-relaxed text-[#8c7e74]">
                            A modern product management platform for teams that care about quality and speed.
                        </p>

                        {/* Social icons */}
                        <div className="mt-6 flex gap-3">
                            {socials.map(({ label, href, icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ede8e2] bg-white text-[#8c7e74] hover:border-[#e8622a]/50 hover:bg-[#fff3ed] hover:text-[#e8622a] transition-all duration-200"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-4 sm:grid-cols-4">

                        {Object.entries(links).map(([section, items]) => (
                            <div key={section}>

                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2c2420]/60">
                                    {section}
                                </h4>

                                <ul className="space-y-3">

                                    {items.map((item) => (

                                        <li key={item.name}>

                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `text-sm transition-colors duration-200 ${isActive
                                                        ? "text-[#e8622a] font-semibold"
                                                        : "text-[#8c7e74] hover:text-[#e8622a]"
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>

                                        </li>

                                    ))}

                                </ul>

                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#ede8e2]">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                        <p className="text-xs text-[#8c7e74]">
                            © {YEAR} <span className="text-[#2c2420] font-semibold">SHOPx</span>. All rights reserved.
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-[#8c7e74]">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            All systems operational
                        </div>

                        <div className="flex gap-5">
                            {[
                                { name: "Privacy", path: "/privacy-policy" },
                                { name: "Terms", path: "/terms-of-service" },
                                { name: "Cookies", path: "/cookie-policy" }
                            ].map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className="text-xs text-[#8c7e74] hover:text-[#e8622a] transition-colors duration-200"
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
