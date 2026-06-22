import { useEffect, useState } from "react";
import { getAllProducts } from "../services/api";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";

const TrendingProducts = () => {
    const [products, setProducts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch]               = useState("");

    const loadProducts = async () => {
        try {
            const data = await getAllProducts();
            // Filter only products with a rating greater than 4.0
            const trending = data.filter((p) => p.rating && p.rating.rate > 4);
            setProducts(trending);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const filtered = products.filter((p) => {
        return p.title.toLowerCase().includes(search.toLowerCase()) ||
               p.category.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }}>
            {/* Product section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

                {/* Section header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: "#2c2420" }}>
                            <span className="inline-flex items-center gap-2"><svg className="h-5 w-5 text-[#e8622a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg> Trending Products</span>
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: "#8c7e74" }}>
                            Top-rated favorites of our community (4.0+ Stars)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div
                            className="flex items-center gap-3 rounded-full border px-4 py-2 bg-white border-[#e4dfd9] transition-all duration-300 focus-within:border-[#e8622a] focus-within:ring-4 focus-within:ring-[#e8622a]/15 shadow-sm focus-within:shadow-md focus-within:w-64 w-48"
                            style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        >
                            <svg className="h-4 w-4 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ color: search ? "#e8622a" : "#8c7e74" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search trending…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-sm outline-none font-medium bg-transparent text-[#2c2420] placeholder-[#a69c93]"
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch("")} 
                                    className="text-[#8c7e74] hover:text-[#e8622a] hover:scale-110 active:scale-95 transition-all cursor-pointer font-bold text-xs px-1"
                                >
                                    ✕
                                </button>
                            )}
                        </div>


                    </div>
                </div>

                {/* Divider */}
                <div className="mb-6 h-px" style={{ background: "#ede8e2" }} />

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
                        <p className="text-lg font-semibold" style={{ color: "#5a4e46" }}>No trending products found</p>
                        <p className="text-sm" style={{ color: "#8c7e74" }}>Try a different search term</p>
                    </div>
                ) : (
                    <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                        {filtered.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={(id) => {
                                    const p = products.find((item) => item.id === id);
                                    setSelectedProduct(p);
                                }}
                                onDeleteSuccess={(id) => {
                                    setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
                                }}
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
                    onDeleteSuccess={(id) => {
                        setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
                    }}
                />
            )}
        </div>
    );
};

export default TrendingProducts;
