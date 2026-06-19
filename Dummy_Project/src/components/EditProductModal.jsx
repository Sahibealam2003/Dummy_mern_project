import React, { useEffect, useState } from "react";

const FIELD_CLS = "w-full rounded-xl border border-[#e4dfd9] bg-[#fafafa] px-4 py-2 text-sm text-[#2c2420] placeholder-[#a69c93] outline-none focus:bg-[#fafafa] focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all duration-200";
const LABEL_CLS = "block text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] mb-1";

const EditProductModal = ({ isOpen, onClose, onUpdate, product }) => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);
// Prevent background scrolling when modal is open
useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
}, [isOpen]);
    useEffect(() => {
        if (product) {
            setTitle(product.title || "");
            setPrice(product.price !== undefined ? String(product.price) : "");
            setDescription(product.description || "");
            setCategory(product.category || "");
            setImage(product.image || "");
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onUpdate(product.id, { title, price: Number(price), description, category, image });
            onClose();
        } catch (error) {
            console.error("Failed to update product:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45">
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

            <div className="animate-scale-in glass relative w-full max-w-md overflow-hidden rounded-3xl p-5 shadow-2xl shadow-black/10 md:p-6">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:bg-[#fdf9f5] hover:text-[#2c2420] hover:rotate-90 transition-all duration-200"
                    aria-label="Close modal"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-4 pr-6">
                    <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                        Update
                    </span>
                    <h2 className="mt-1.5 text-lg font-bold tracking-tight text-[#2c2420] md:text-xl">
                        Edit Product
                    </h2>
                    <p className="mt-0.5 text-xs text-[#8c7e74]">
                        Modify the details below to update the product information.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className={LABEL_CLS}>Product Title</label>
                        <input className={FIELD_CLS} type="text" placeholder="e.g. Leather Wallet"
                            value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="col-span-1">
                        <label className={LABEL_CLS}>Price ($)</label>
                        <input className={FIELD_CLS} type="number" step="0.01" placeholder="29.99"
                            value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>

                    <div className="col-span-1">
                        <label className={LABEL_CLS}>Category</label>
                        <input className={FIELD_CLS} type="text" placeholder="e.g. Accessories"
                            value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>

                    <div className="col-span-2">
                        <label className={LABEL_CLS}>Image URL (Optional)</label>
                        <input className={FIELD_CLS} type="text" placeholder="https://example.com/image.jpg"
                            value={image} onChange={(e) => setImage(e.target.value)} />
                    </div>

                    <div className="col-span-3">
                        <label className={LABEL_CLS}>Description</label>
                        <textarea className={`${FIELD_CLS} h-20 resize-none`} placeholder="Describe the product features…"
                            value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>

                    <div className="col-span-3 mt-1">
                        <button
                            id="submit-edit-product"
                            className="btn-glow flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d97706] to-[#e8622a] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#d97706]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating…
                                </>
                            ) : "Update Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;
