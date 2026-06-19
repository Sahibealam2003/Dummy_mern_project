import axios from "axios";

const API = axios.create({
    baseURL: "https://fakestoreapi.com",
});

export const getAllProducts = async () => {
    const response = await API.get("/products");
    const apiProducts = response.data;
    const customProducts = JSON.parse(localStorage.getItem("custom_products") || "[]");
    return [...customProducts, ...apiProducts];
};

export const getSingleProduct = async (id) => {
    const customProducts = JSON.parse(localStorage.getItem("custom_products") || "[]");
    const found = customProducts.find(p => p.id === id || String(p.id) === String(id));
    if (found) return found;
    const response = await API.get(`/products/${id}`);
    return response.data;
};

export const deleteProduct = async (id) => {
    let customProducts = JSON.parse(localStorage.getItem("custom_products") || "[]");
    const isCustom = customProducts.some(p => p.id === id || String(p.id) === String(id));
    if (isCustom) {
        customProducts = customProducts.filter(p => p.id !== id && String(p.id) !== String(id));
        localStorage.setItem("custom_products", JSON.stringify(customProducts));
        return { success: true };
    }
    const response = await API.delete(`/products/${id}`);
    return response.data;
};

export const addProduct = async (product) => {
    try {
        await API.post("/products", product);
    } catch (e) {
        console.error("Mock API add product failed:", e);
    }
    const customProducts = JSON.parse(localStorage.getItem("custom_products") || "[]");
    const newProduct = {
        ...product,
        id: product.id || `custom-${Date.now()}`
    };
    customProducts.unshift(newProduct);
    localStorage.setItem("custom_products", JSON.stringify(customProducts));
    return newProduct;
};

export const updateProduct = async (id, updatedProduct) => {
    let customProducts = JSON.parse(localStorage.getItem("custom_products") || "[]");
    const index = customProducts.findIndex(p => p.id === id || String(p.id) === String(id));
    if (index !== -1) {
        customProducts[index] = { ...customProducts[index], ...updatedProduct };
        localStorage.setItem("custom_products", JSON.stringify(customProducts));
        return customProducts[index];
    }
    const response = await API.put(`/products/${id}`, updatedProduct);
    return response.data;
};