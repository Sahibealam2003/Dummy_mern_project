import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    totalPrice: 0,
    totalCount: 0,
};

const recalcTotals = (state) => {
    state.totalCount = state.products.reduce((sum, item) => sum + item.quantity, 0);
    state.totalPrice = state.products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            const existingProduct = state.products.find((p) => p.id === newItem.id);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                state.products.push({ ...newItem, quantity: 1 });
            }
            recalcTotals(state);
        },

        removeFromCart: (state, action) => {
            state.products = state.products.filter((p) => p.id !== action.payload);
            recalcTotals(state);
        },

        incrementQuantity: (state, action) => {
            const product = state.products.find((p) => p.id === action.payload);
            if (product) {
                product.quantity += 1;
            }
            recalcTotals(state);
        },

        decrementQuantity: (state, action) => {
            const product = state.products.find((p) => p.id === action.payload);
            if (product) {
                if (product.quantity <= 1) {
                    state.products = state.products.filter((p) => p.id !== action.payload);
                } else {
                    product.quantity -= 1;
                }
            }
            recalcTotals(state);
        },

        clearCart: (state) => {
            state.products = [];
            state.totalPrice = 0;
            state.totalCount = 0;
        },
    },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;