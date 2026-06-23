import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getCartApi, 
    addToCartApi, 
    updateCartItemApi, 
    removeFromCartApi, 
    clearCartApi 
} from "../services/api";

const getLocalCart = () => {
    try {
        const local = localStorage.getItem("cart");
        return local ? JSON.parse(local) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalCart = (products) => {
    try {
        localStorage.setItem("cart", JSON.stringify(products));
    } catch (e) {
        console.error("LocalStorage save failed", e);
    }
};

const calculateTotals = (products) => {
    const totalCount = products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalPrice = products.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
    );
    return { totalCount, totalPrice };
};

// Async Thunks under original action names to prevent changing React imports
export const fetchCart = createAsyncThunk("cart/fetch", async (_, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (isLoggedIn) {
            const data = await getCartApi();
            saveLocalCart(data);
            return data;
        } else {
            return getLocalCart();
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to fetch cart");
    }
});

export const addToCart = createAsyncThunk("cart/add", async (product, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (isLoggedIn) {
            const data = await addToCartApi(product.id || product._id, 1);
            saveLocalCart(data);
            return data;
        } else {
            const products = getLocalCart();
            const existing = products.find(p => p.id === product.id || p._id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                products.push({ ...product, quantity: 1 });
            }
            saveLocalCart(products);
            return products;
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to add item to cart");
    }
});

export const removeFromCart = createAsyncThunk("cart/remove", async (productId, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (isLoggedIn) {
            const data = await removeFromCartApi(productId);
            saveLocalCart(data);
            return data;
        } else {
            const products = getLocalCart().filter(p => p.id !== productId && p._id !== productId);
            saveLocalCart(products);
            return products;
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to remove item from cart");
    }
});

export const incrementQuantity = createAsyncThunk("cart/increment", async (productId, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (isLoggedIn) {
            const currentItem = getState().cart.products.find(p => p.id === productId || p._id === productId);
            const newQty = currentItem ? currentItem.quantity + 1 : 1;
            const data = await updateCartItemApi(productId, newQty);
            saveLocalCart(data);
            return data;
        } else {
            const products = getLocalCart();
            const item = products.find(p => p.id === productId || p._id === productId);
            if (item) {
                item.quantity += 1;
            }
            saveLocalCart(products);
            return products;
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to increment item quantity");
    }
});

export const decrementQuantity = createAsyncThunk("cart/decrement", async (productId, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        const currentItem = getState().cart.products.find(p => p.id === productId || p._id === productId);
        if (!currentItem) return getState().cart.products;

        if (isLoggedIn) {
            const newQty = currentItem.quantity - 1;
            let data;
            if (newQty <= 0) {
                data = await removeFromCartApi(productId);
            } else {
                data = await updateCartItemApi(productId, newQty);
            }
            saveLocalCart(data);
            return data;
        } else {
            let products = getLocalCart();
            const item = products.find(p => p.id === productId || p._id === productId);
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    products = products.filter(p => p.id !== productId && p._id !== productId);
                }
            }
            saveLocalCart(products);
            return products;
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to decrement item quantity");
    }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (isLoggedIn) {
            const data = await clearCartApi();
            saveLocalCart([]);
            return data;
        } else {
            saveLocalCart([]);
            return [];
        }
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to clear cart");
    }
});

// Merging guest cart to user database cart upon successful login
export const mergeCart = createAsyncThunk("cart/merge", async (_, { getState, rejectWithValue }) => {
    try {
        const { isLoggedIn } = getState().auth;
        if (!isLoggedIn) return getLocalCart();

        const localProducts = getLocalCart();
        if (localProducts.length === 0) {
            const data = await getCartApi();
            saveLocalCart(data);
            return data;
        }

        console.log("Merging local guest cart items to database...");
        let data = [];
        for (const item of localProducts) {
            data = await addToCartApi(item.id || item._id, item.quantity);
        }

        saveLocalCart(data);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Failed to merge cart");
    }
});

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        products: getLocalCart(),
        totalPrice: calculateTotals(getLocalCart()).totalPrice,
        totalCount: calculateTotals(getLocalCart()).totalCount,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addMatcher(
                (action) => action.type.startsWith("cart/") && action.type.endsWith("/fulfilled"),
                (state, action) => {
                    state.products = action.payload || [];
                    const { totalCount, totalPrice } = calculateTotals(state.products);
                    state.totalCount = totalCount;
                    state.totalPrice = totalPrice;
                    state.loading = false;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("cart/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("cart/") && action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export default cartSlice.reducer;