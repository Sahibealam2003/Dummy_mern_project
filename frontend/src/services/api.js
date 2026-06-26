import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    withCredentials: true,
});

export const getAllProducts = async (params = {}) => {
    const response = await API.get("/products", { params });
    return response.data;
};

export const getSingleProduct = async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
};

export const createProductApi = async (productData) => {
    const response = await API.post("/products", productData);
    return response.data;
};

export const updateProductApi = async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
};

export const deleteProductApi = async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
};

export const getAllSpecialOffers = async () => {
    const response = await API.get("/special-offers");
    return response.data;
};

export const createSpecialOfferApi = async (offerData) => {
    const response = await API.post("/special-offers", offerData);
    return response.data;
};

export const updateSpecialOfferApi = async (id, offerData) => {
    const response = await API.put(`/special-offers/${id}`, offerData);
    return response.data;
};

export const deleteSpecialOfferApi = async (id) => {
    const response = await API.delete(`/special-offers/${id}`);
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await API.post("/orders", orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await API.get("/orders/my-orders");
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
};

export const getAllOrders = async () => {
    const response = await API.get("/orders/all/list");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await API.put(`/orders/${id}/status`, { status });
    return response.data;
};

// Cart APIs
export const getCartApi = async () => {
    const response = await API.get("/cart");
    return response.data;
};

export const addToCartApi = async (productId, quantity = 1) => {
    const response = await API.post("/cart", { productId, quantity });
    return response.data;
};

export const updateCartItemApi = async (productId, quantity) => {
    const response = await API.put("/cart", { productId, quantity });
    return response.data;
};

export const removeFromCartApi = async (productId) => {
    const response = await API.delete(`/cart/${productId}`);
    return response.data;
};

export const clearCartApi = async () => {
    const response = await API.delete("/cart");
    return response.data;
};

export const cancelOrderApi = async (id) => {
    const response = await API.put(`/orders/${id}/cancel`);
    return response.data;
};

export const deleteOrderApi = async (id) => {
    const response = await API.delete(`/orders/${id}`);
    return response.data;
};
    