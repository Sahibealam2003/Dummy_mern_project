import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/api";
import { v4 as uuidv4 } from "uuid";

const FIELD_CLS = "w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-[#2c2420] placeholder-[#a69c93] border border-transparent outline-none focus:bg-white focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all duration-200";
const LABEL_CLS = "block text-[10px] font-extrabold uppercase tracking-wider text-[#8c7e74] mb-1.5";

const AddProduct = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdProduct, setCreatedProduct] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const productData = {
            id: uuidv4(),
            title,
            price: Number(price),
            description,
            category,
            image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
            rating: { rate: 5.0, count: 1 } // new products default high rating
        };

        try {
            await addProduct(productData);
            setCreatedProduct(productData);
            setSuccess(true);
            setTitle("");
            setPrice("");
            setDescription("");
            setCategory("");
            setImage("");
        } catch (error) {
            console.error("Failed to add product:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (success && createdProduct) {
        return (
            <div className="flex min-h-[calc(100vh-104px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8" style={{ background: "#f5f3ef" }}>
                <div className="animate-scale-in relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#ede8e2] bg-white p-8 text-center shadow-xl md:p-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
                        <svg className="h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 mb-3">
                        Success
                    </span>

                    <h2 className="text-2xl font-black text-[#2c2420]">Product Published!</h2>
                    <p className="mt-2 text-sm text-[#8c7e74]">
                        Your product "<span className="font-semibold text-[#5a4e46]">{createdProduct.title}</span>" has been created and saved successfully.
                    </p>

                    {/* Preview of created product */}
                    <div className="mx-auto mt-6 flex items-center gap-4 rounded-2xl border border-[#ede8e2] bg-[#fdfbf9] p-3 text-left max-w-sm">
                        <img 
                            src={createdProduct.image} 
                            alt={createdProduct.title} 
                            className="h-16 w-16 rounded-xl object-contain bg-white p-1 border border-[#ede8e2] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider">{createdProduct.category}</p>
                            <h4 className="text-sm font-bold text-[#2c2420] truncate mt-0.5">{createdProduct.title}</h4>
                            <p className="text-sm font-extrabold text-[#e8622a] mt-1">${createdProduct.price.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setCreatedProduct(null);
                            }}
                            className="btn-glow inline-flex cursor-pointer justify-center items-center rounded-xl border border-[#ede8e2] bg-white px-5 py-3 text-xs font-bold text-[#5a4e46] hover:bg-[#fdf9f5] hover:text-[#2c2420] transition-all"
                        >
                            Add Another Product
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="btn-glow inline-flex cursor-pointer justify-center items-center rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#e8622a]/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            View on Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-104px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8" style={{ background: "#f5f3ef" }}>
            <div className="animate-scale-in relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#ede8e2] bg-white p-6 shadow-xl md:p-8">
                {/* Background decorative blob */}
                <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#e8622a]/5 blur-3xl pointer-events-none" />

                <div className="mb-6">
                    <span className="inline-block rounded-full bg-[#fff3ed] border border-[#e8622a]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#e8622a]">
                        Inventory Control
                    </span>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#2c2420]">
                        Add New Product
                    </h2>
                    <p className="mt-1 text-sm text-[#8c7e74]">
                        Create a new product listing that will display instantly on our store.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative">
                    <div>
                        <label className={LABEL_CLS}>Product Title</label>
                        <input 
                            className={FIELD_CLS} 
                            type="text" 
                            placeholder="e.g. Premium Leather Cardholder"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </div>

                    <div>
                        <label className={LABEL_CLS}>Description</label>
                        <textarea 
                            className={`${FIELD_CLS} h-28 resize-none`} 
                            placeholder="Provide a detailed description of the product features and materials…"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Price ($)</label>
                            <input 
                                className={FIELD_CLS} 
                                type="number" 
                                step="0.01" 
                                placeholder="49.99"
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Category</label>
                            <input 
                                className={FIELD_CLS} 
                                type="text" 
                                placeholder="e.g. Accessories"
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className={LABEL_CLS}>Image URL (Optional)</label>
                        <input 
                            className={FIELD_CLS} 
                            type="url" 
                            placeholder="https://images.unsplash.com/..."
                            value={image} 
                            onChange={(e) => setImage(e.target.value)} 
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="btn-glow flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#ede8e2] bg-white py-3 text-center text-xs font-bold text-[#5a4e46] hover:bg-[#fdf9f5] hover:text-[#2c2420] transition-all duration-200"
                        >
                            Cancel
                        </button>
                        
                        <button
                            id="submit-add-product"
                            className="btn-glow flex-[2] flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-3 text-xs font-bold text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Publishing...
                                </>
                            ) : "Publish Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
