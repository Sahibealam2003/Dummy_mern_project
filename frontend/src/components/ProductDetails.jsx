import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSingleProduct, deleteProductApi } from "../services/api";

const ProductDetails = ({ product: initialProduct, onClose, onDeleteSuccess }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const navigate = useNavigate();
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const isAdmin = isLoggedIn && user?.role === "admin";

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handleDeleteClick = () => {
        setDeleteError("");
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!product) return;
        setDeleteLoading(true);
        setDeleteError("");
        try {
            const productId = product.id || product._id;
            await deleteProductApi(productId);
            setDeleteModalOpen(false);
            onClose();
            if (onDeleteSuccess) {
                onDeleteSuccess(productId);
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error("Delete product error:", err);
            setDeleteError(err.response?.data?.error || "Failed to delete product. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!initialProduct) return;
            if (isNaN(Number(initialProduct.id))) {
                setProduct(initialProduct);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getSingleProduct(initialProduct.id);
                setProduct(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setProduct(initialProduct);
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [initialProduct]);

    if (!initialProduct) return null;

    /* Render star rating */
    const renderStars = (rate) => {
        return Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={`h-4 w-4 ${i < Math.round(rate) ? "text-amber-400" : "text-[#ede8e2]"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45">
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

            <div className="animate-scale-in glass relative w-full max-w-3xl overflow-hidden rounded p-6 shadow-2xl shadow-black/10 md:p-8 animate-border-glow">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:bg-[#fdf9f5] hover:text-[#2c2420] transition-all duration-200 hover:rotate-90"
                    aria-label="Close modal"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-4">
                        <div className="skeleton h-72 w-full rounded-2xl" />
                        <div className="flex flex-col gap-4">
                            <div className="skeleton h-3 w-1/4 rounded" />
                            <div className="skeleton h-7 w-3/4 rounded" />
                            <div className="skeleton h-4 w-full rounded" />
                            <div className="skeleton h-4 w-5/6 rounded" />
                            <div className="skeleton h-4 w-2/3 rounded" />
                            <div className="mt-auto skeleton h-10 w-1/3 rounded-xl" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4"><svg className="h-12 w-12 text-[#c44e1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
                        <p className="text-[#2c2420] font-medium">{error}</p>
                        <button onClick={onClose} className="mt-6 rounded-xl border border-[#ede8e2] bg-white px-5 py-2 text-sm font-semibold text-[#2c2420] hover:bg-[#fdf9f5] transition-colors">Close</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-2">
                        {/* Image panel */}
                        <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white border border-[#ede8e2] p-6 md:h-80">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="max-h-full max-w-full object-contain transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                        {/* Info panel */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <span className="inline-block rounded-full bg-[#fff3ed] border border-[#e8622a]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e8622a]">
                                    {product.category}
                                </span>

                                <h2 className="mt-3 text-xl font-bold leading-snug text-[#2c2420] md:text-2xl">
                                    {product.title}
                                </h2>

                                {product.rating && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex">{renderStars(product.rating.rate)}</div>
                                        <span className="text-xs font-semibold text-[#2c2420]">{product.rating.rate}</span>
                                        <span className="text-xs text-[#8c7e74]">({product.rating.count} reviews)</span>
                                    </div>
                                )}

                                <p className="mt-4 text-sm leading-relaxed text-[#8c7e74] line-clamp-5">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-6 border-t border-[#ede8e2] pt-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7e74]">Price</span>
                                    <span className="text-2xl font-extrabold text-[#2c7a4a]">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    {isAdmin && product && (
                                        <>
                                            <button
                                                onClick={handleDeleteClick}
                                                className="btn-glow cursor-pointer rounded-xl bg-rose-600 text-white h-10 px-4 shadow-md shadow-rose-600/25 hover:shadow-rose-600/40 hover:bg-rose-750 transition-all duration-200 flex items-center justify-center gap-1.5 font-bold text-xs border border-rose-500 hover:scale-[1.02] active:scale-[0.98]"
                                                title="Delete Product"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    navigate("/admin");
                                                }}
                                                className="btn-glow cursor-pointer rounded-xl bg-amber-500 text-white h-10 px-4 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:bg-amber-600 transition-all duration-200 flex items-center justify-center gap-1.5 font-bold text-xs border border-amber-400 hover:scale-[1.02] active:scale-[0.98]"
                                                title="Edit Product"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Edit
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="btn-glow cursor-pointer rounded-xl border border-[#ede8e2] bg-white h-10 w-10 text-[#2c2420] hover:bg-[#fdf9f5] transition-all duration-200 flex items-center justify-center"
                                        aria-label="Close details"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                            <path d="M704 288h-281.6l177.6-202.88a32 32 0 0 0-48.32-42.24l-224 256a30.08 30.08 0 0 0-2.24 3.84 32 32 0 0 0-2.88 4.16v1.92a32 32 0 0 0 0 5.12A32 32 0 0 0 320 320a32 32 0 0 0 0 4.8 32 32 0 0 0 0 5.12v1.92a32 32 0 0 0 2.88 4.16 30.08 30.08 0 0 0 2.24 3.84l224 256a32 32 0 1 0 48.32-42.24L422.4 352H704a224 224 0 0 1 224 224v128a224 224 0 0 1-224 224H320a232 232 0 0 1-28.16-1.6 32 32 0 0 0-35.84 27.84 32 32 0 0 0 2.56 12.16c-35.84-2.56-35.84-2.56-35.84-2.56-1.6-1.6-28.16-1.6-28.16-1.6a295.04 295.04 0 0 0 0 590.08h384a288 288 0 0 0 288-288v-128a288 288 0 0 0-288-288z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Confirm Deletion */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                        <div className="absolute inset-0 cursor-pointer" onClick={() => !deleteLoading && setDeleteModalOpen(false)} />

                        <div className="glass relative w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in text-center">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={deleteLoading}
                                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                            >
                                ✕
                            </button>

                            {/* Danger Icon */}
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>

                            <h3 className="text-lg font-black text-[#2c2420] mb-2">
                                Confirm Deletion
                            </h3>
                            <p className="text-xs text-[#8c7e74] mb-5 font-medium leading-relaxed">
                                Are you sure you want to permanently delete this product? This action cannot be undone.
                            </p>

                            {/* Preview Section */}
                            {product && (
                                <div className="mb-6 rounded-xl border border-[#ede8e2] bg-[#fafafa]/50 p-4 text-left flex items-center gap-3">
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white border border-[#ede8e2] flex items-center justify-center p-1 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-[#2c2420] truncate">
                                            {product.title}
                                        </p>
                                        <p className="text-[10px] text-[#2c7a4a] font-extrabold mt-0.5">
                                            ${product.price?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {deleteError && (
                                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake text-left">
                                    {deleteError}
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="w-full rounded-xl bg-rose-600 text-white hover:bg-rose-700 px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {deleteLoading && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {deleteLoading ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
