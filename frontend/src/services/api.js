import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    withCredentials: true,
});

export const getAllProducts = async () => {
    const response = await API.get("/products");
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