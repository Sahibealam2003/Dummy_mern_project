import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct, addProduct, updateProduct } from "../services/api";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { v4 as uuidv4 } from "uuid";

/* ── Hero banner slides ───────────────────────────────── */
const SLIDES = [
    {
        id: 0,
        tag: "New Year Sale",
        headline: "upto 70% OFF",
        sub: "On Electronics & Gadgets",
        cta: "Explore Now",
        bg: "linear-gradient(135deg, #a78bfa 0%, #c084fc 40%, #f472b6 80%, #fb7185 100%)",
        img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        dark: false,
    },
    {
        id: 1,
        tag: "Flash Sale",
        headline: "upto 50% OFF",
        sub: "On Fashion & Clothing",
        cta: "Shop Now",
        bg: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)",
        img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
        dark: false,
    },
    {
        id: 2,
        tag: "Mega Deals",
        headline: "Buy 1 Get 1",
        sub: "On Jewellery & Accessories",
        cta: "Grab Deal",
        bg: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #0d9488 100%)",
        img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
        dark: false,
    },
];



const HeroBanner = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

    const handleCtaClick = () => {
        const target = document.getElementById("product-section");
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const prev = SLIDES[(current - 1 + SLIDES.length) % SLIDES.length];
    const slide = SLIDES[current];
    const next = SLIDES[(current + 1) % SLIDES.length];

    return (
        <div className="relative overflow-hidden" style={{ background: "#f5f3ef" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
                <div className="flex items-stretch gap-3" style={{ height: 220 }}>
                    {/* Left side peek */}
                    <div
                        className="hidden md:flex w-32 shrink-0 items-center justify-center rounded-xl cursor-pointer transition-transform hover:scale-[1.01] overflow-hidden relative"
                        style={{ background: prev.bg, opacity: 0.65 }}
                        onClick={() => setCurrent((current - 1 + SLIDES.length) % SLIDES.length)}
                    >
                        <div className="text-center text-white px-2 pointer-events-none">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{prev.tag}</p>
                            <p className="text-xs font-black truncate">{prev.headline}</p>
                        </div>
                    </div>

                    {/* Main slide */}
                    <div
                        className="flex-1 rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 shadow-sm"
                        style={{ background: slide.bg }}
                    >
                        {/* Content side */}
                        <div className="relative z-10 max-w-md flex flex-col justify-between h-full text-left">
                            <div>
                                <span className="inline-block rounded-full bg-white/20 border border-white/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white mb-2">
                                    {slide.tag}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                                    {slide.headline}
                                </h2>
                                <p className="text-xs md:text-sm text-white/90 font-medium mt-1">
                                    {slide.sub}
                                </p>
                            </div>
                            <button 
                                onClick={handleCtaClick}
                                className="btn-glow inline-flex w-fit items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-bold text-[#2c2420] hover:bg-[#fcfaf7] active:scale-95 transition-all mt-4 cursor-pointer"
                            >
                                {slide.cta} →
                            </button>
                        </div>

                        {/* Text instead of Image */}
                        <div className="absolute right-8 top-6 bottom-6 left-[55%] hidden md:flex flex-col justify-center text-left text-white border-l border-white/20 pl-8 pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md self-start mb-2">
                                Special Promotion
                            </span>
                            <h4 className="text-sm font-extrabold">Shop Premium Quality</h4>
                            <p className="text-xs text-white/80 leading-relaxed mt-1">
                                Get access to verified merchandise, custom vendor discounts, and express door-to-door delivery.
                            </p>
                        </div>

                        {/* Navigation dots */}
                        <div className="absolute bottom-4 right-6 flex gap-1.5 z-15">
                            {SLIDES.map((s, idx) => (
                                <button
                                    key={s.id}
                                    onClick={() => setCurrent(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === current ? "w-4 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right side peek */}
                    <div
                        className="hidden md:flex w-32 shrink-0 items-center justify-center rounded-xl cursor-pointer transition-transform hover:scale-[1.01] overflow-hidden relative"
                        style={{ background: next.bg, opacity: 0.65 }}
                        onClick={() => setCurrent((current + 1) % SLIDES.length)}
                    >
                        <div className="text-center text-white px-2 pointer-events-none">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{next.tag}</p>
                            <p className="text-xs font-black truncate">{next.headline}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



/* ProductList */
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const loadProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) { console.error(error); }
    };

    const handleAddProduct = async (productDataFromModal) => {
        const productData = {
            id: uuidv4(),
            title: productDataFromModal.title,
            price: Number(productDataFromModal.price),
            description: productDataFromModal.description,
            category: productDataFromModal.category,
            image: productDataFromModal.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        };
        try {
            await addProduct(productData);
            setProducts((prev) => [productData, ...prev]);
            setSelectedProduct(productData);
        } catch (error) { console.log(error); throw error; }
    };

    const handleUpdateProduct = async (id, updatedData) => {
        try {
            if (!isNaN(Number(id))) await updateProduct(id, updatedData);
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
            );
            setSelectedProduct((prev) =>
                prev && prev.id === id ? { ...prev, ...updatedData } : prev
            );
        } catch (error) { console.error(error); throw error; }
    };

    const categories = ["All", ...new Set(products.map((p) => p.category))];

    const filtered = products.filter((p) => {
        const matchSearch =
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter
            ? p.category.toLowerCase().includes(categoryFilter.toLowerCase())
            : true;
        return matchSearch && matchCat;
    });

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }}>
            {/* Hero */}
            <HeroBanner />


            {/* Product section */}
            <div id="product-section" className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

                {/* Section header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: "#2c2420" }}>
                            {categoryFilter ? `${categoryFilter}` : "All Products"}
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: "#8c7e74" }}>
                            {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div
                            className="flex items-center gap-2 rounded-xl border px-3 py-1.5 bg-[#fafafa] border-[#e4dfd9] transition-all duration-200 focus-within:bg-[#fafafa] focus-within:border-[#e8622a] focus-within:ring-4 focus-within:ring-[#e8622a]/10"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "#8c7e74" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-44 text-sm outline-none"
                                style={{ background: "transparent", color: "#2c2420" }}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ color: "#8c7e74" }}>✕</button>
                            )}
                        </div>

                        {/* Category clear */}
                        {categoryFilter && (
                            <button
                                onClick={() => setCategoryFilter("")}
                                className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all"
                                style={{ background: "#fff3ed", borderColor: "#f9cbb3", color: "#e8622a" }}
                            >
                                {categoryFilter} ✕
                            </button>
                        )}

                        {/* Add product */}
                        <button
                            id="add-product-btn"
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                            style={{ background: "#2c2420", color: "#ffffff" }}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="mb-6 h-px" style={{ background: "#ede8e2" }} />

                {/* Categories filtering strip */}
                {categories.length > 1 && (() => {
                    /* ── Category icon map ── */
                    const catIcons = {
                        "All": (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        ),
                        "men's clothing": (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l4 4-2 1v5h4l1 8H5l1-8h4V7L8 6l4-4z" />
                            </svg>
                        ),
                        "women's clothing": (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 5 7 8c0 2 1 3.5 2.5 4.5L8 22h8l-1.5-9.5C16 11.5 17 10 17 8c0-3-2-6-5-6z" />
                            </svg>
                        ),
                        "jewelery": (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L6 8l6 14 6-14-6-6zM6 8h12" />
                            </svg>
                        ),
                        "electronics": (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        ),
                    };

                    const getCatCount = (cat) => {
                        if (cat === "All") return products.length;
                        return products.filter(
                            (p) => p.category.toLowerCase() === cat.toLowerCase()
                        ).length;
                    };

                    return (
                        <div
                            className="flex gap-3 mb-8 pb-1 overflow-x-auto"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <style>{`.cat-strip::-webkit-scrollbar { display: none; }`}</style>
                            {categories.map((cat) => {
                                const isActive =
                                    cat === "All" ? !categoryFilter : categoryFilter === cat;
                                const count = getCatCount(cat);
                                const icon = catIcons[cat.toLowerCase()] || catIcons["All"];

                                return (
                                    <button
                                        key={cat}
                                        onClick={() =>
                                            setCategoryFilter(cat === "All" ? "" : cat)
                                        }
                                        className="group relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl border-2 px-5 py-1 text-sm font-semibold outline-none transition-all duration-300 cursor-pointer"
                                        style={{
                                            minWidth: "fit-content",
                                            background: isActive
                                                ? "linear-gradient(135deg, #fff3ed 0%, #ffe8d9 100%)"
                                                : "#ffffff",
                                            borderColor: isActive ? "#e8622a" : "#ede8e2",
                                            color: isActive ? "#e8622a" : "#6b5e54",
                                            boxShadow: isActive
                                                ? "0 4px 16px rgba(232,98,42,0.15), 0 1px 3px rgba(232,98,42,0.1)"
                                                : "0 1px 3px rgba(0,0,0,0.04)",
                                            transform: isActive ? "translateY(-1px)" : "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.borderColor = "#d4c1b0";
                                                e.currentTarget.style.color = "#2c2420";
                                                e.currentTarget.style.background =
                                                    "linear-gradient(135deg, #faf8f6 0%, #f5f0ec 100%)";
                                                e.currentTarget.style.boxShadow =
                                                    "0 4px 12px rgba(0,0,0,0.06)";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.borderColor = "#ede8e2";
                                                e.currentTarget.style.color = "#6b5e54";
                                                e.currentTarget.style.background = "#ffffff";
                                                e.currentTarget.style.boxShadow =
                                                    "0 1px 3px rgba(0,0,0,0.04)";
                                                e.currentTarget.style.transform = "none";
                                            }
                                        }}
                                    >
                                        {/* Icon */}
                                        <span
                                            className="flex items-center justify-center rounded-xl p-1.5 transition-colors duration-300"
                                            style={{
                                                background: isActive
                                                    ? "rgba(232,98,42,0.12)"
                                                    : "rgba(140,126,116,0.08)",
                                            }}
                                        >
                                            {icon}
                                        </span>

                                        {/* Label */}
                                        <span className="capitalize">{cat}</span>

                                        {/* Count badge */}
                                        <span
                                            className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold leading-none transition-colors duration-300"
                                            style={{
                                                background: isActive
                                                    ? "#e8622a"
                                                    : "rgba(140,126,116,0.1)",
                                                color: isActive ? "#ffffff" : "#8c7e74",
                                            }}
                                        >
                                            {count}
                                        </span>

                                        {/* Active indicator dot */}
                                        {isActive && (
                                            <span
                                                className="absolute -bottom-1 left-1/2 h-1.5 w-6 rounded-full"
                                                style={{
                                                    transform: "translateX(-50%)",
                                                    background:
                                                        "linear-gradient(90deg, #e8622a 0%, #f59e0b 100%)",
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })()}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="product-card p-4">
                                <div className="skeleton mb-4 h-40 w-full rounded-xl" />
                                <div className="skeleton mb-2 h-3 w-1/3 rounded" />
                                <div className="skeleton mb-3 h-4 w-3/4 rounded" />
                                <div className="skeleton h-3 w-1/4 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-4 text-5xl">🔍</div>
                        <p className="text-lg font-semibold" style={{ color: "#5a4e46" }}>No products found</p>
                        <p className="text-sm" style={{ color: "#8c7e74" }}>Try a different search term</p>
                    </div>
                ) : (
                    <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={(id) => {
                                    const p = products.find((item) => item.id === id);
                                    setSelectedProduct(p);
                                }}
                                onDelete={handleDeleteProduct}
                                onEdit={(product) => setEditingProduct(product)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedProduct && (
                <ProductDetails
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onEdit={(product) => {
                        setSelectedProduct(null);
                        setEditingProduct(product);
                    }}
                />
            )}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddProduct}
            />
            <EditProductModal
                isOpen={!!editingProduct}
                onClose={() => setEditingProduct(null)}
                onUpdate={handleUpdateProduct}
                product={editingProduct}
            />
        </div>
    );
};

export default ProductList;