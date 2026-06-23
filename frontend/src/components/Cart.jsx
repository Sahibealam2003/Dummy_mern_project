import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
} from "../reducers/cartSlice";

const EmptyCartWarning = ({ onConfirm, onCancel }) => (
    <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 animate-scale-in">
        <div className="flex items-center gap-2 mb-1">
            <span className="text-sm"><svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span>
            <p className="text-xs font-bold text-rose-800">Cart will be empty!</p>
        </div>
        <p className="text-[10px] leading-relaxed text-rose-600 mb-2.5">
            This is the last item. Removing it will clear your cart.
        </p>
        <div className="flex gap-2">
            <button
                onClick={onConfirm}
                className="flex-1 rounded-lg bg-rose-600 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-rose-700 active:scale-95 cursor-pointer"
            >
                Yes, Remove
            </button>
            <button
                onClick={onCancel}
                className="flex-1 rounded-lg border border-rose-200 bg-white py-1.5 text-[10px] font-bold text-rose-700 transition-all hover:bg-rose-50 active:scale-95 cursor-pointer"
            >
                Keep It
            </button>
        </div>
    </div>
);

// Cart item 
const CartItem = ({ item }) => {
    const [showWarning, setShowWarning] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const dispatch = useDispatch();

    const handleDecrement = () => {
        if (item.quantity === 1) {
            setShowWarning(true);
        } else {
            dispatch(decrementQuantity(item.id));
        }
    };

    return (
        <div
            className={`rounded-xl border p-3 transition-all duration-200 ${showWarning
                ? "border-rose-300 bg-rose-50/40"
                : "border-[#ede8e2] bg-white hover:border-[#e8622a]/30 hover:bg-[#fdf9f5]"
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Image */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white border border-[#ede8e2] p-1.5">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-contain"
                    />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    {/* Title + Remove */}
                    <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#2c2420]">
                            {item.title}
                        </p>
                    <div className="relative">
                        <button
                            id={`remove-cart-item-${item.id}`}
                            onClick={() => setShowRemoveConfirm(!showRemoveConfirm)}
                            className="shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-[#8c7e74] transition-all duration-150 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            aria-label={`Remove ${item.title}`}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {showRemoveConfirm && (
                            <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border border-rose-200 bg-white p-3 shadow-lg animate-scale-in">
                                <p className="text-[11px] font-bold text-rose-700 mb-1 flex items-center gap-1">
                                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    Remove this item?
                                </p>
                                <div className="flex gap-1.5 mt-2">
                                    <button
                                        onClick={() => { dispatch(removeFromCart(item.id)); setShowRemoveConfirm(false); }}
                                        className="flex-1 rounded-lg bg-rose-600 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-rose-700 active:scale-95 cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => setShowRemoveConfirm(false)}
                                        className="flex-1 rounded-lg border border-[#ede8e2] py-1.5 text-[10px] font-bold text-[#5a4e46] transition-all hover:bg-[#f5f3ef] active:scale-95 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-wider text-[#8c7e74]">{item.category}</p>

                    {/* Price and Qty controls */}
                    <div className="flex items-center justify-between mt-0.5">
                        <span className="text-sm font-extrabold text-[#2c7a4a]">
                            ${(item.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                id={`cart-decrement-${item.id}`}
                                onClick={handleDecrement}
                                className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold transition-all duration-150 active:scale-90 cursor-pointer ${item.quantity === 1
                                    ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    : "border-[#ede8e2] bg-white text-[#2c2420] hover:border-[#e8622a]/50 hover:bg-[#fff3ed] hover:text-[#e8622a]"
                                    }`}
                            >
                                −
                            </button>
                            <span className="flex h-6 w-7 items-center justify-center rounded border border-[#ede8e2] bg-[#fdfbf8] text-xs font-bold text-[#2c2420]">
                                {item.quantity}
                            </span>
                            <button
                                id={`cart-increment-${item.id}`}
                                onClick={() => dispatch(incrementQuantity(item.id))}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-[#ede8e2] bg-white text-xs font-bold text-[#2c2420] transition-all duration-150 hover:border-[#e8622a]/50 hover:bg-[#fff3ed] hover:text-[#e8622a] active:scale-90 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {item.quantity > 1 && (
                        <p className="text-[10px] text-[#8c7e74]">${item.price.toFixed(2)} each</p>
                    )}
                </div>
            </div>

            {showWarning && (
                <EmptyCartWarning
                    onConfirm={() => {
                        dispatch(decrementQuantity(item.id));
                        setShowWarning(false);
                    }}
                    onCancel={() => setShowWarning(false)}
                />
            )}
        </div>
    );
};

// Auth Prompt Modal Sub-component
const AuthPromptModal = ({ isOpen, onClose, onChooseOption }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div onClick={onClose} className="fixed inset-0 bg-[#2c2420]/50 backdrop-blur-sm transition-opacity duration-300" />
            
            {/* Modal Box */}
            <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-[#ede8e2] bg-white p-6 shadow-2xl animate-scale-in z-10 text-center">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] transition-all hover:bg-stone-50 cursor-pointer"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="mt-4 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#e8622a] mb-4">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-[#2c2420]">Authentication Required</h3>
                    <p className="mt-2 text-xs text-[#8c7e74] leading-relaxed max-w-xs">
                        You need to log in or create an account to secure your billing details and complete the checkout.
                    </p>

                    <div className="mt-6 w-full space-y-2.5">
                        <button
                            onClick={() => onChooseOption("login")}
                            className="btn-glow w-full rounded-lg bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#e8622a]/20 transition-all cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => onChooseOption("signup")}
                            className="w-full rounded-lg border border-[#ede8e2] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#5a4e46] transition-all hover:bg-stone-50 cursor-pointer"
                        >
                            Create Account
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg text-xs font-bold text-[#8c7e74] hover:text-[#2c2420] transition-colors py-1.5 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Cart
const Cart = ({ isOpen, onClose }) => {
    const cartItems = useSelector((state) => state.cart.products);
    const totalCount = useSelector((state) => state.cart.totalCount);
    const totalPrice = useSelector((state) => state.cart.totalPrice);
    const { isLoggedIn } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Prevent background scrolling when cart drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [isOpen]);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-[#2c2420]/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Drawer */}
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    background: "linear-gradient(160deg, #ffffff 0%, #fdfbf9 100%)",
                    borderLeft: "1px solid #ede8e2",
                    boxShadow: "-10px 0 40px rgba(44,36,32,0.15)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#ede8e2] px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white shadow-lg shadow-[#e8622a]/20">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                <path fillRule="evenodd" d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z M7.11287151,13 L16.7694281,13 C16.9028277,12.9273528 17.0065461,12.8077563 17.0587744,12.6622214 L17.1075574,12.548839 C17.131074,12.5023208 17.131074,12.5023208 17.2371473,12.2923487 C17.3785994,12.0122452 17.3785994,12.0122452 17.5790088,11.6150733 C17.9326498,10.9140516 18.2862826,10.2118596 18.6162844,9.55492931 L18.6307708,9.52609021 C19.2088812,8.37515943 19.6504574,7.49032194 19.8933745,6.9949252 L6.01025746,6.00073455 L6.99015389,12.8600168 C6.99973088,12.9277585 7.0486615,12.9821505 7.11287151,13 Z M16,20 C16.5522847,20 17,19.5522847 17,19 C17,18.4477153 16.5522847,18 16,18 C15.4477153,18 15,18.4477153 15,19 C15,19.5522847 15.4477153,20 16,20 Z M8,20 C8.55228475,20 9,19.5522847 9,19 C9,18.4477153 8.55228475,18 8,18 C7.44771525,18 7,18.4477153 7,19 C7,19.5522847 7.44771525,20 8,20 Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#2c2420]">Your Cart</h2>
                            <p className="text-xs text-[#8c7e74]">
                                {totalCount} item{totalCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            id="close-cart-btn"
                            onClick={onClose}
                            aria-label="Close cart"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] bg-white text-[#8c7e74] transition-all duration-200 hover:rotate-90 hover:bg-[#fdf9f5] hover:text-[#2c2420] cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <svg className="h-16 w-16 text-[#8c7e74] mb-4 opacity-40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                <path fillRule="evenodd" d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z M7.11287151,13 L16.7694281,13 C16.9028277,12.9273528 17.0065461,12.8077563 17.0587744,12.6622214 L17.1075574,12.548839 C17.131074,12.5023208 17.131074,12.5023208 17.2371473,12.2923487 C17.3785994,12.0122452 17.3785994,12.0122452 17.5790088,11.6150733 C17.9326498,10.9140516 18.2862826,10.2118596 18.6162844,9.55492931 L18.6307708,9.52609021 C19.2088812,8.37515943 19.6504574,7.49032194 19.8933745,6.9949252 L6.01025746,6.00073455 L6.99015389,12.8600168 C6.99973088,12.9277585 7.0486615,12.9821505 7.11287151,13 Z M16,20 C16.5522847,20 17,19.5522847 17,19 C17,18.4477153 16.5522847,18 16,18 C15.4477153,18 15,18.4477153 15,19 C15,19.5522847 15.4477153,20 16,20 Z M8,20 C8.55228475,20 9,19.5522847 9,19 C9,18.4477153 8.55228475,18 8,18 C7.44771525,18 7,18.4477153 7,19 C7,19.5522847 7.44771525,20 8,20 Z" />
                            </svg>
                            <p className="text-base font-semibold text-[#2c2420]">Your cart is empty</p>
                            <p className="mt-1 text-sm text-[#8c7e74]">Add products to get started</p>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate("/");
                                }}
                                className="mt-6 rounded-lg border border-[#e8622a]/30 bg-[#fff3ed] px-5 py-2 text-sm font-semibold text-[#e8622a] transition-all duration-200 hover:bg-[#ffe5d9] cursor-pointer"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => <CartItem key={item.id} item={item} />)
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (() => {
                    const shippingFee = totalPrice >= 49 ? 0.0 : 5.99;
                    const tax = totalPrice * 0.1;
                    const finalTotal = totalPrice + tax + shippingFee;
                    return (
                        <div className="border-t border-[#ede8e2] px-5 py-4 space-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-[#8c7e74]">
                                    <span>Subtotal ({totalCount} item{totalCount !== 1 ? "s" : ""})</span>
                                    <span className="font-semibold text-[#2c2420]">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#8c7e74]">
                                    <span>Shipping</span>
                                    {shippingFee === 0 ? (
                                        <span className="font-bold text-[#2c7a4a]">Free</span>
                                    ) : (
                                        <span className="font-semibold text-[#2c2420]">${shippingFee.toFixed(2)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-[#8c7e74]">
                                    <span>Tax (10%)</span>
                                    <span className="font-semibold text-[#2c2420]">${tax.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-[#ede8e2] to-transparent" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#2c2420]">Total</span>
                                    <span className="text-xl font-extrabold text-[#2c2420]">
                                        ${finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                             <button
                                id="checkout-btn"
                                onClick={() => {
                                    if (isLoggedIn) {
                                        onClose();
                                        navigate("/checkout");
                                    } else {
                                        setShowAuthPrompt(true);
                                    }
                                }}
                                className="btn-glow w-full rounded-lg bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-3 text-sm font-semibold text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 hover:from-[#c44e1e] hover:to-[#a83c10] cursor-pointer"
                            >
                                Checkout · ${finalTotal.toFixed(2)}
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full rounded-lg border border-[#ede8e2] bg-transparent py-2.5 text-xs font-semibold text-[#8c7e74] transition-all duration-200 hover:border-[#d4c9be] hover:text-[#2c2420] cursor-pointer"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    );
                })()}
            </aside>

            <AuthPromptModal
                isOpen={showAuthPrompt}
                onClose={() => setShowAuthPrompt(false)}
                onChooseOption={(option) => {
                    setShowAuthPrompt(false);
                    onClose();
                    if (option === "signup") {
                        navigate(`/signup?redirect=/checkout`);
                    } else {
                        navigate(`/login?redirect=/checkout`);
                    }
                }}
            />
        </>
    );
};

export default Cart;
