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