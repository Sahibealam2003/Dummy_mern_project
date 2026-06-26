import axios from "axios";

const AUTH_API = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8080/api/auth",
    withCredentials: true,
});

export const signupApi = async (formData) => {
    const response = await AUTH_API.post("/signup", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const verifyOtpApi = async (email, otp) => {
    const response = await AUTH_API.post("/verify-otp", { email, otp });
    return response.data;
};

export const loginApi = async (email, password) => {
    const response = await AUTH_API.post("/login", { email, password });
    return response.data;
};

export const logoutApi = async () => {
    const response = await AUTH_API.post("/logout");
    return response.data;
};

export const updateProfileApi = async (formData) => {
    const response = await AUTH_API.put("/update-profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getWishlistApi = async () => {
    const response = await AUTH_API.get("/wishlist");
    return response.data;
};

export const toggleWishlistApi = async (productId) => {
    const response = await AUTH_API.post(`/wishlist/${productId}`);
    return response.data;
};

export const forgotPasswordApi = async (email) => {
    const response = await AUTH_API.post("/forgot-password", { email });
    return response.data;
};
export const sendFToken = async(token)=>{
    const response = await AUTH_API.post("/save-token", {
        token: token
    });
    return response.data;
}