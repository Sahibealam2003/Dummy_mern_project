import React, { useState } from "react";
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Tag, 
    Settings, 
    Bell, 
    Menu, 
    X,
    User,
    LogOut,
    HelpCircle,
    ShoppingCart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
        { label: "Products", icon: ShoppingBag, to: "/admin?tab=products" },
        { label: "Special Offers", icon: Tag, to: "/admin?tab=offers" },
        { label: "Orders", icon: ShoppingCart, to: "/admin?tab=orders" },
    ];

    return (
        <div className="flex h-screen bg-[#f5f3ef] text-[#2c2420] overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#ede8e2] shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-[#ede8e2]">
                    <Link to="/" className="flex items-center hover:opacity-85 transition-opacity">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white shadow-md shadow-[#e8622a]/20">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="ml-2.5 text-lg font-black tracking-tight">
                            SHOP<span className="text-[#e8622a]">x</span> Admin
                        </span>
                    </Link>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = currentPath === item.to || (item.to.includes("tab=") && location.search.includes(item.to.split("?")[1]));
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    active
                                        ? "bg-[#e8622a]/8 text-[#e8622a]"
                                        : "text-[#5a4e46] hover:text-[#2c2420] hover:bg-stone-100/60"
                                }`}
                            >
                                <Icon className="h-4.5 w-4.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#ede8e2]">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#5a4e46] hover:text-[#2c2420] hover:bg-stone-100/60 transition-all"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        Back to Shop
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden bg-[#2c2420]/45 backdrop-blur-sm">
                    <div className="w-64 bg-white flex flex-col h-full animate-scale-in">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-[#ede8e2]">
                            <Link to="/" className="flex items-center hover:opacity-85 transition-opacity">
                                <span className="text-lg font-black tracking-tight">
                                    SHOP<span className="text-[#e8622a]">x</span> Admin
                                </span>
                            </Link>
                            <button onClick={() => setSidebarOpen(false)} className="text-[#8c7e74] hover:text-[#2c2420]">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = currentPath === item.to;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                            active
                                                ? "bg-[#e8622a]/8 text-[#e8622a]"
                                                : "text-[#5a4e46] hover:text-[#2c2420] hover:bg-[#faf9f7]"
                                        }`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-[#ede8e2]">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#5a4e46] hover:text-[#2c2420] transition-all"
                            >
                                <LogOut className="h-4.5 w-4.5" />
                                Back to Shop
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-[#ede8e2] flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-[#5a4e46] hover:text-[#2c2420] p-1 rounded-lg hover:bg-stone-100"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        
                        {/* Clickable Mobile Logo */}
                        <Link to="/" className="md:hidden flex items-center gap-2 select-none group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white shadow-md shadow-[#e8622a]/20 group-hover:scale-105 transition-transform duration-300">
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-sm font-black tracking-tight" style={{ color: "#2c2420" }}>SHOP</span>
                                <span className="text-sm font-black tracking-tight" style={{ color: "#e8622a" }}>x</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-xl text-[#8c7e74] hover:text-[#2c2420] hover:bg-stone-100 transition-all">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#e8622a]" />
                        </button>

                        <div className="h-8 w-px bg-[#ede8e2]" />

                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                AD
                            </div>
                            <span className="hidden sm:inline text-xs font-bold text-[#2c2420]">
                                Admin Portal
                            </span>
                        </div>
                    </div>
                </header>

                {/* Dashboard body wrap */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
