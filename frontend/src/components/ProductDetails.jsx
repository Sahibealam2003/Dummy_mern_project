import React, { useEffect, useState } from "react";
import { getSingleProduct } from "../services/api";

const ProductDetails = ({ product: initialProduct, onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                            <div className="mt-6 flex items-center justify-between border-t border-[#ede8e2] pt-5">
                                <div>
                                    <span className="text-xs text-[#8c7e74] block">Price</span>
                                    <span className="text-2xl font-extrabold text-[#2c7a4a]">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="btn-glow cursor-pointer rounded-xl border border-[#ede8e2] bg-white h-10 w-10 text-[#2c2420] hover:bg-[#fdf9f5] transition-all duration-200 flex items-center justify-center"
                                        aria-label="Close details"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                            <path d="M704 288h-281.6l177.6-202.88a32 32 0 0 0-48.32-42.24l-224 256a30.08 30.08 0 0 0-2.24 3.84 32 32 0 0 0-2.88 4.16v1.92a32 32 0 0 0 0 5.12A32 32 0 0 0 320 320a32 32 0 0 0 0 4.8 32 32 0 0 0 0 5.12v1.92a32 32 0 0 0 2.88 4.16 30.08 30.08 0 0 0 2.24 3.84l224 256a32 32 0 1 0 48.32-42.24L422.4 352H704a224 224 0 0 1 224 224v128a224 224 0 0 1-224 224H320a232 232 0 0 1-28.16-1.6 32 32 0 0 0-35.84 27.84 32 32 0 0 0 27.84 35.52A295.04 295.04 0 0 0 320 992h384a288 288 0 0 0 288-288v-128a288 288 0 0 0-288-288zM103.04 760a32 32 0 0 0-62.08 16A289.92 289.92 0 0 0 140.16 928a32 32 0 0 0 40-49.92 225.6 225.6 0 0 1-77.12-118.08zM64 672a32 32 0 0 0 22.72-9.28 37.12 37.12 0 0 0 6.72-10.56A32 32 0 0 0 96 640a33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72 32 32 0 0 0-34.88 6.72A32 32 0 0 0 32 640a32 32 0 0 0 2.56 12.16 37.12 37.12 0 0 0 6.72 10.56A32 32 0 0 0 64 672z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
