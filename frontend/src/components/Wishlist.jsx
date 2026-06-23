import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getWishlistApi } from "../services/authApi";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";

const Wishlist = () => {
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login?redirect=/wishlist");
            return;
        }
        if (user?.role === "admin") {
            navigate("/");
            return;
        }

        const fetchWishlist = async () => {
            try {
                const data = await getWishlistApi();
                const mappedData = data.map((p) => ({
                    ...p,
                    id: p._id ? p._id.toString() : p.id
                }));
                setProducts(mappedData);
            } catch (err) {
                console.error("Failed to load wishlist products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isLoggedIn, user, navigate]);

    // Automatically remove items from local products state when they are removed from the Redux wishlist
    const activeProducts = products.filter((p) => {
        const prodId = (p.id || p._id)?.toString();
        return user?.wishlist?.some(item => {
            const wishId = (item._id || item)?.toString();
            return wishId === prodId;
        });
    });

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-32 text-center animate-fade-in">
                <div className="flex flex-col items-center gap-5">
                    <svg className="h-12 w-12 animate-spin text-[#e8622a]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm font-semibold text-[#8c7e74]">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }} className="pb-16 pt-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#2c2420] tracking-tight">My Wishlist</h1>
                    <p className="text-sm text-[#8c7e74] mt-1">
                        {activeProducts.length} item{activeProducts.length !== 1 ? "s" : ""} saved
                    </p>
                </div>

                {/* Divider */}
                <div className="mb-8 h-px bg-[#ede8e2]" />

                {activeProducts.length === 0 ? (
                    <div className="rounded-3xl border border-[#ede8e2] bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-6">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-[#2c2420]">Your wishlist is empty</h2>
                        <p className="mt-1.5 text-xs text-[#8c7e74] max-w-xs mx-auto">
                            Add items you love to your wishlist to keep track of them and buy them later.
                        </p>
                        <Link
                            to="/"
                            className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#e8622a]/10 hover:opacity-95 transition-all"
                        >
                            Explore Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in-up">
                        {activeProducts.map((product) => (
                            <ProductCard
                                key={product.id || product._id}
                                product={product}
                                onClick={(id) => {
                                    const p = products.find((item) => item.id === id || item._id === id);
                                    setSelectedProduct(p);
                                }}
                                onDeleteSuccess={(id) => {
                                    setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
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
                        setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
                    }}
                />
            )}
        </div>
    );
};

export default Wishlist;
