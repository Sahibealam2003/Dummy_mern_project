import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
    getAllProducts, 
    createProductApi, 
    updateProductApi, 
    deleteProductApi,
    getAllSpecialOffers,
    createSpecialOfferApi,
    updateSpecialOfferApi,
    deleteSpecialOfferApi
} from "../services/api";

const AdminPanel = () => {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState("products");
    
    // Products State
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    
    // Product Form Fields
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("electronics");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    // Special Offers State
    const [offers, setOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(true);
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);

    // Offer Form Fields
    const [offerCode, setOfferCode] = useState("");
    const [offerDiscount, setOfferDiscount] = useState("");
    const [offerTitle, setOfferTitle] = useState("");
    const [offerDesc, setOfferDesc] = useState("");
    const [offerExpiry, setOfferExpiry] = useState("");
    const [offerTag, setOfferTag] = useState("");
    const [offerIcon, setOfferIcon] = useState("");
    const [offerColor, setOfferColor] = useState("#e8622a");
    const [offerBg, setOfferBg] = useState("#fff3ed");
    
    // Global form feedback states
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Authorization Guard
    useEffect(() => {
        if (!isLoggedIn || !user || user.role !== "admin") {
            navigate("/");
        }
    }, [isLoggedIn, user, navigate]);

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const data = await getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            setOffersLoading(true);
            const data = await getAllSpecialOffers();
            setOffers(data);
        } catch (err) {
            console.error("Failed to load special offers:", err);
        } finally {
            setOffersLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && user?.role === "admin") {
            fetchProducts();
            fetchOffers();
        }
    }, [isLoggedIn, user]);

    // Prevent background scrolling when product/offer modals are open
    useEffect(() => {
        if (productModalOpen || offerModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [productModalOpen, offerModalOpen]);


    // Product Modal Helpers
    const openCreateProductModal = () => {
        setCurrentProduct(null);
        setTitle("");
        setPrice("");
        setCategory("electronics");
        setDescription("");
        setImage("");
        setError("");
        setSuccess("");
        setProductModalOpen(true);
    };

    const openEditProductModal = (product) => {
        setCurrentProduct(product);
        setTitle(product.title);
        setPrice(product.price);
        setCategory(product.category);
        setDescription(product.description);
        setImage(product.image);
        setError("");
        setSuccess("");
        setProductModalOpen(true);
    };

    const handleProductDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProductApi(id);
            setProducts(products.filter((p) => p.id !== id && p._id !== id));
        } catch (err) {
            console.error("Delete product error:", err);
            alert("Failed to delete product. Please try again.");
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFormLoading(true);

        if (!title || !price || !description || !category) {
            setError("All fields except Image URL are required.");
            setFormLoading(false);
            return;
        }

        const productData = {
            title,
            price: Number(price),
            description,
            category,
            image
        };

        try {
            if (currentProduct) {
                const id = currentProduct.id || currentProduct._id;
                const updated = await updateProductApi(id, productData);
                setProducts(products.map((p) => (p.id === id || p._id === id ? updated : p)));
                setSuccess("Product updated successfully!");
            } else {
                const created = await createProductApi(productData);
                setProducts([created, ...products]);
                setSuccess("Product created successfully!");
            }
            
            setTimeout(() => {
                setProductModalOpen(false);
                setSuccess("");
            }, 1000);
        } catch (err) {
            console.error("Save product error:", err);
            setError(err.response?.data?.error || "Failed to save product.");
        } finally {
            setFormLoading(false);
        }
    };

    // Special Offer Modal Helpers
    const openCreateOfferModal = () => {
        setCurrentOffer(null);
        setOfferCode("");
        setOfferDiscount("");
        setOfferTitle("");
        setOfferDesc("");
        setOfferExpiry("");
        setOfferTag("");
        setOfferIcon("");
        setOfferColor("#e8622a");
        setOfferBg("#fff3ed");
        setError("");
        setSuccess("");
        setOfferModalOpen(true);
    };

    const openEditOfferModal = (offer) => {
        setCurrentOffer(offer);
        setOfferCode(offer.code);
        setOfferDiscount(offer.discount);
        setOfferTitle(offer.title);
        setOfferDesc(offer.desc);
        setOfferExpiry(offer.expiry);
        setOfferTag(offer.tag);
        setOfferIcon(offer.icon || "");
        setOfferColor(offer.color || "#e8622a");
        setOfferBg(offer.bg || "#fff3ed");
        setError("");
        setSuccess("");
        setOfferModalOpen(true);
    };

    const handleOfferDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this special offer?")) return;
        try {
            await deleteSpecialOfferApi(id);
            setOffers(offers.filter((o) => o.id !== id && o._id !== id));
        } catch (err) {
            console.error("Delete offer error:", err);
            alert("Failed to delete special offer. Please try again.");
        }
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFormLoading(true);

        if (!offerCode || !offerDiscount || !offerTitle || !offerDesc || !offerExpiry || !offerTag) {
            setError("Required fields (Code, Discount, Title, Description, Expiry, Tag) are missing.");
            setFormLoading(false);
            return;
        }

        const offerData = {
            code: offerCode.toUpperCase(),
            discount: offerDiscount,
            title: offerTitle,
            desc: offerDesc,
            expiry: offerExpiry,
            tag: offerTag,
            icon: offerIcon,
            color: offerColor,
            bg: offerBg
        };

        try {
            if (currentOffer) {
                const id = currentOffer.id || currentOffer._id;
                const updated = await updateSpecialOfferApi(id, offerData);
                setOffers(offers.map((o) => (o.id === id || o._id === id ? updated.specialOffer : o)));
                setSuccess("Special offer updated successfully!");
            } else {
                const created = await createSpecialOfferApi(offerData);
                setOffers([created.specialOffer, ...offers]);
                setSuccess("Special offer created successfully!");
            }
            
            setTimeout(() => {
                setOfferModalOpen(false);
                setSuccess("");
            }, 1000);
        } catch (err) {
            console.error("Save offer error:", err);
            setError(err.response?.data?.error || "Failed to save special offer.");
        } finally {
            setFormLoading(false);
        }
    };

    if (!isLoggedIn || !user || user.role !== "admin") {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8" style={{ background: "#f5f3ef", minHeight: "85vh" }}>
            {/* Header Dashboard Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 mb-2">
                        Admin Controller
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-[#2c2420]">
                        SHOPx Admin Dashboard
                    </h2>
                    <p className="text-xs text-[#8c7e74] mt-1 font-medium">
                        Manage inventory products and configure promotional special offers/coupons.
                    </p>
                </div>

                {activeTab === "products" ? (
                    <button
                        onClick={openCreateProductModal}
                        className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Product
                    </button>
                ) : (
                    <button
                        onClick={openCreateOfferModal}
                        className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#e8622a] text-white hover:bg-[#d94e14] px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Special Offer
                    </button>
                )}
            </div>

            {/* Tabs for Admin Panels */}
            <div className="flex gap-4 border-b border-[#ede8e2] mb-8">
                <button
                    onClick={() => { setActiveTab("products"); setError(""); setSuccess(""); }}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === "products"
                            ? "border-[#e8622a] text-[#e8622a]"
                            : "border-transparent text-[#8c7e74] hover:text-[#2c2420]"
                    }`}
                >
                    Products Inventory ({products.length})
                </button>
                <button
                    onClick={() => { setActiveTab("offers"); setError(""); setSuccess(""); }}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === "offers"
                            ? "border-[#e8622a] text-[#e8622a]"
                            : "border-transparent text-[#8c7e74] hover:text-[#2c2420]"
                    }`}
                >
                    Special Offers & Coupons ({offers.length})
                </button>
            </div>

            {/* TAB CONTENT: PRODUCTS */}
            {activeTab === "products" && (
                <>
                    {productsLoading ? (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                            <p className="text-sm font-semibold text-[#5a4e46]">No products found</p>
                            <button onClick={fetchProducts} className="text-xs text-[#e8622a] font-bold hover:underline mt-2">
                                Reload Database
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                                            <th className="p-4 w-20">Image</th>
                                            <th className="p-4">Title</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4 text-right">Price</th>
                                            <th className="p-4 text-center w-36">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f3ef]">
                                        {products.map((product) => (
                                            <tr key={product.id || product._id} className="hover:bg-stone-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="h-12 w-12 rounded-lg bg-stone-50 border border-[#ede8e2] flex items-center justify-center p-1.5 overflow-hidden">
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-xs md:max-w-md">
                                                    <p className="text-sm font-bold text-[#2c2420] truncate" title={product.title}>
                                                        {product.title}
                                                    </p>
                                                    <p className="text-[10px] text-[#8c7e74] truncate max-w-sm font-medium">
                                                        {product.description}
                                                    </p>
                                                </td>
                                                <td className="p-4 capitalize">
                                                    <span className="inline-flex rounded-full bg-stone-100 border border-stone-200/40 px-2.5 py-0.5 text-[10px] font-bold text-stone-600">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-extrabold text-[#2c7a4a] text-sm">
                                                    ${product.price?.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => openEditProductModal(product)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/20 transition-all cursor-pointer"
                                                            title="Edit Product"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleProductDelete(product.id || product._id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/20 transition-all cursor-pointer"
                                                            title="Delete Product"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* TAB CONTENT: OFFERS */}
            {activeTab === "offers" && (
                <>
                    {offersLoading ? (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]" />
                            ))}
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                            <p className="text-sm font-semibold text-[#5a4e46]">No special offers or coupons found</p>
                            <button onClick={fetchOffers} className="text-xs text-[#e8622a] font-bold hover:underline mt-2">
                                Reload Offers
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                                            <th className="p-4 w-32">Tag</th>
                                            <th className="p-4">Coupon Code</th>
                                            <th className="p-4">Discount</th>
                                            <th className="p-4">Title</th>
                                            <th className="p-4">Expiry</th>
                                            <th className="p-4 text-center">Style</th>
                                            <th className="p-4 text-center w-36">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f3ef]">
                                        {offers.map((offer) => (
                                            <tr key={offer.id || offer._id} className="hover:bg-stone-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <span 
                                                        className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                                                        style={{ color: offer.color, background: offer.bg }}
                                                    >
                                                        {offer.tag}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-extrabold text-sm text-[#2c2420]">
                                                    {offer.code}
                                                </td>
                                                <td className="p-4 text-sm font-black text-[#e8622a]">
                                                    {offer.discount}
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm font-bold text-[#2c2420] truncate max-w-xs">{offer.title}</p>
                                                    <p className="text-[10px] text-[#8c7e74] truncate max-w-xs font-medium">{offer.desc}</p>
                                                </td>
                                                <td className="p-4 text-xs font-bold text-[#8c7e74]">
                                                    {offer.expiry}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <span className="w-4 h-4 rounded-full border border-stone-200/50 inline-block" style={{ backgroundColor: offer.color }} title={`Text: ${offer.color}`} />
                                                        <span className="w-4 h-4 rounded-full border border-stone-200/50 inline-block" style={{ backgroundColor: offer.bg }} title={`Bg: ${offer.bg}`} />
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => openEditOfferModal(offer)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/20 transition-all cursor-pointer"
                                                            title="Edit Special Offer"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOfferDelete(offer.id || offer._id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/20 transition-all cursor-pointer"
                                                            title="Delete Special Offer"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal: Create/Edit Product */}
            {productModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                    <div className="absolute inset-0 cursor-pointer" onClick={() => !formLoading && setProductModalOpen(false)} />

                    <div className="glass relative w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in">
                        <button
                            onClick={() => setProductModalOpen(false)}
                            disabled={formLoading}
                            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-black text-[#2c2420] mb-2">
                            {currentProduct ? "Modify Product Details" : "Stock New Catalog Product"}
                        </h3>
                        <p className="text-xs text-[#8c7e74] mb-5 font-medium leading-relaxed">
                            Fill in information below. This is synced across all customer accounts.
                        </p>

                        {error && (
                            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Product Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Wireless Headset"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Retail Price (USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="e.g. 59.99"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a] cursor-pointer"
                                    >
                                        <option value="electronics">Electronics</option>
                                        <option value="men's clothing">Men's Clothing</option>
                                        <option value="women's clothing">Women's Clothing</option>
                                        <option value="jewelery">Jewelery</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Image URL (optional)</label>
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        placeholder="https://example.com/photo.jpg"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief specifications, details, sizing, material description..."
                                    disabled={formLoading}
                                    rows="3"
                                    className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setProductModalOpen(false)}
                                    disabled={formLoading}
                                    className="rounded-xl border px-5 py-2.5 text-xs font-bold transition-all border-[#d4c9be] text-[#5a4e46] hover:bg-[#faf9f7] cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {formLoading && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {currentProduct ? "Save Changes" : "Publish Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CREATE/EDIT SPECIAL OFFER */}
            {offerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                    <div className="absolute inset-0 cursor-pointer" onClick={() => !formLoading && setOfferModalOpen(false)} />

                    <div className="glass relative w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in">
                        <button
                            onClick={() => setOfferModalOpen(false)}
                            disabled={formLoading}
                            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-black text-[#2c2420] mb-2">
                            {currentOffer ? "Modify Special Offer" : "Create New Special Offer"}
                        </h3>
                        <p className="text-xs text-[#8c7e74] mb-5 font-medium leading-relaxed">
                            Configure promotional discount code and tags. Dynamic offers render immediately on client page.
                        </p>

                        {error && (
                            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleOfferSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Coupon Code</label>
                                    <input
                                        type="text"
                                        value={offerCode}
                                        onChange={(e) => setOfferCode(e.target.value)}
                                        placeholder="e.g. SUMMER50"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a] font-mono font-bold uppercase"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Discount Value</label>
                                    <input
                                        type="text"
                                        value={offerDiscount}
                                        onChange={(e) => setOfferDiscount(e.target.value)}
                                        placeholder="e.g. 50% OFF, FREE SHIPPING"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Offer Title</label>
                                    <input
                                        type="text"
                                        value={offerTitle}
                                        onChange={(e) => setOfferTitle(e.target.value)}
                                        placeholder="e.g. Mid-Summer Mega Event"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Offer Tag</label>
                                    <input
                                        type="text"
                                        value={offerTag}
                                        onChange={(e) => setOfferTag(e.target.value)}
                                        placeholder="e.g. FLASH SALE, CARD DEAL"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Expiry Description</label>
                                    <input
                                        type="text"
                                        value={offerExpiry}
                                        onChange={(e) => setOfferExpiry(e.target.value)}
                                        placeholder="e.g. Expires Aug 30, 2026"
                                        disabled={formLoading}
                                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Text/Accent Color (Hex)</label>
                                    <div className="flex gap-1">
                                        <input
                                            type="color"
                                            value={offerColor}
                                            onChange={(e) => setOfferColor(e.target.value)}
                                            className="w-10 h-10 border rounded-xl cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={offerColor}
                                            onChange={(e) => setOfferColor(e.target.value)}
                                            placeholder="#e8622a"
                                            disabled={formLoading}
                                            className="rounded-xl border border-[#e4dfd9] px-3 py-2 text-xs w-full bg-white focus:outline-none focus:border-[#e8622a]"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Background Color (Hex)</label>
                                    <div className="flex gap-1">
                                        <input
                                            type="color"
                                            value={offerBg}
                                            onChange={(e) => setOfferBg(e.target.value)}
                                            className="w-10 h-10 border rounded-xl cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={offerBg}
                                            onChange={(e) => setOfferBg(e.target.value)}
                                            placeholder="#fff3ed"
                                            disabled={formLoading}
                                            className="rounded-xl border border-[#e4dfd9] px-3 py-2 text-xs w-full bg-white focus:outline-none focus:border-[#e8622a]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Description</label>
                                <textarea
                                    value={offerDesc}
                                    onChange={(e) => setOfferDesc(e.target.value)}
                                    placeholder="Valid on electronics category. Minimum order $100."
                                    disabled={formLoading}
                                    rows="2"
                                    className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">SVG Icon Markup (optional)</label>
                                <textarea
                                    value={offerIcon}
                                    onChange={(e) => setOfferIcon(e.target.value)}
                                    placeholder='e.g. <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path ... /></svg>'
                                    disabled={formLoading}
                                    rows="2"
                                    className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-[#e8622a] font-mono"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOfferModalOpen(false)}
                                    disabled={formLoading}
                                    className="rounded-xl border px-5 py-2.5 text-xs font-bold transition-all border-[#d4c9be] text-[#5a4e46] hover:bg-[#faf9f7] cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {formLoading && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {currentOffer ? "Save Changes" : "Publish Offer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
