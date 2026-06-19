import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct, addProduct, updateProduct } from "../services/api";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { v4 as uuidv4 } from "uuid";

const TrendingProducts = () => {
    const [products, setProducts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
    const [editingProduct, setEditingProduct]   = useState(null);
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
            rating: { rate: 5.0, count: 1 } // new products default high rating
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
                            className="flex items-center gap-2 rounded-xl border px-3 py-1.5 bg-[#fafafa] border-[#e4dfd9] transition-all duration-200 focus-within:bg-white focus-within:border-[#e8622a] focus-within:ring-4 focus-within:ring-[#e8622a]/10"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "#8c7e74" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search trending…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-44 text-sm outline-none bg-transparent text-[#2c2420]"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ color: "#8c7e74" }}>✕</button>
                            )}
                        </div>

                        {/* Add product */}
                        <button
                            id="add-product-btn"
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
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

export default TrendingProducts;
