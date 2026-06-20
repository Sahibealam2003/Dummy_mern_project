import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("shopx_user");
let initialUser = null;
let initialIsLoggedIn = false;

try {
    if (storedUser) {
        initialUser = JSON.parse(storedUser);
        initialIsLoggedIn = true;
    }
} catch (e) {
    localStorage.removeItem("shopx_user");
}

const initialState = {
    isLoggedIn: initialIsLoggedIn,
    user: initialUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload;
            localStorage.setItem("shopx_user", JSON.stringify(action.payload));
        },
        signupSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload;
            localStorage.setItem("shopx_user", JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            localStorage.removeItem("shopx_user");
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("shopx_user", JSON.stringify(state.user));
        },
    },
});

export const { loginSuccess, signupSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
