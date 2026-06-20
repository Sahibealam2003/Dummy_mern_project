import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cartSlice";
import authReducer from "./reducers/authSlice";

const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer
    }
})

export default store