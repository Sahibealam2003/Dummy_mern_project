import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, incrementQuantity, decrementQuantity } from "../reducers/cartSlice";
import { deleteProductApi } from "../services/api";

const ProductCard = ({ product, onClick }) => {
    const [showRemovePopup, setShowRemovePopup] = useState(false);
    const popupRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const isAdmin = isLoggedIn && user?.role === "admin";

    const cartItem = useSelector((state) =>
        state.cart.products.find((p) => p.id === product.id)
    );
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        if (!showRemovePopup) return;
        const handler = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target))
                setShowRemovePopup(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showRemovePopup]);

    const handleDecrement = () => {
        if (quantityInCart === 1) setShowRemovePopup(true);
        else dispatch(decrementQuantity(product.id));
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
            try {
                await deleteProductApi(product.id || product._id);
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Failed to delete product");
            }
        }
    };

    return (
        <article className="product-card animate-fade-in-up flex flex-col group relative overflow-hidden">
            {/* Image area */}
            <div
                className="relative flex h-48 items-center justify-center overflow-hidden transition-colors"
                style={{ background: "#faf8f5" }}
            >
                {/* Category badge */}
                <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide z-10"
                    style={{ background: "#f0ece6", color: "#8c7e74" }}
                >
                    {product.category}
                </span>

                {/* Cart qty badge */}
                {quantityInCart > 0 && (
                    <span
                        className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white z-10 shadow-sm"
                        style={{ background: "#e8622a" }}
                    >
                        {quantityInCart}
                    </span>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-[#2c2420]/15 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px] z-20">
                    {/* View Details */}
                    <button
                        id={`view-product-${product.id}`}
                        onClick={() => onClick(product.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-[#ede8e2] text-[#8c7e74] hover:text-[#e8622a] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="View Details"
                    >
                        <svg fill="currentColor" className="h-4 w-4" viewBox="0 0 24 24">
                            <g id="view">
                                <g>
                                    <path d="M12,21c-5,0-8.8-2.8-11.8-8.5L0,12l0.2-0.5C3.2,5.8,7,3,12,3s8.8,2.8,11.8,8.5L24,12l-0.2,0.5C20.8,18.2,17,21,12,21z M2.3,12c2.5,4.7,5.7,7,9.7,7s7.2-2.3,9.7-7C19.2,7.3,16,5,12,5S4.8,7.3,2.3,12z"/>
                                </g>
                                <g>
                                    <path d="M12,17c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S14.8,17,12,17z M12,9c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3S13.7,9,12,9z"/>
                                </g>
                            </g>
                        </svg>
                    </button>

                    {isAdmin && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate("/admin"); }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/25 border border-amber-400 hover:bg-amber-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Edit Product"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/25 border border-rose-500 hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Delete Product"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                <img
                    src={product.image}
                    alt={product.title}
                    className="h-36 w-36 object-contain transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-2.5 p-4 justify-between">
                <div className="space-y-1">
                    <h3
                        className="line-clamp-2 text-sm font-semibold leading-snug min-h-[40px]"
                        style={{ color: "#2c2420" }}
                    >
                        {product.title}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-base font-extrabold" style={{ color: "#2c7a4a" }}>
                            ${product.price?.toFixed(2)}
                        </span>
                        {product.rating && (
                            <span
                                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: "#fff8e6", color: "#b45309" }}
                            >
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> {product.rating.rate}
                            </span>
                        )}
                    </div>
                </div>

                {/* Add to cart / Qty controls */}
                {!isAdmin && (
                    <div className="mt-2 pt-1">
                        {quantityInCart === 0 ? (
                            <button
                                id={`add-to-cart-${product.id}`}
                                onClick={() => dispatch(addToCart(product))}
                                className="w-full rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:bg-[#3d3028] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                style={{ background: "#2c2420" }}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z M7.11287151,13 L16.7694281,13 C16.9028277,12.9273528 17.0065461,12.8077563 17.0587744,12.6622214 L17.1075574,12.548839 C17.131074,12.5023208 17.131074,12.5023208 17.2371473,12.2923487 C17.3785994,12.0122452 17.3785994,12.0122452 17.5790088,11.6150733 C17.9326498,10.9140516 18.2862826,10.2118596 18.6162844,9.55492931 L18.6307708,9.52609021 C19.2088812,8.37515943 19.6504574,7.49032194 19.8933745,6.9949252 L6.01025746,6.00073455 L6.99015389,12.8600168 C6.99973088,12.9277585 7.0486615,12.9821505 7.11287151,13 Z M16,20 C16.5522847,20 17,19.5522847 17,19 C17,18.4477153 16.5522847,18 16,18 C15.4477153,18 15,18.4477153 15,19 C15,19.5522847 15.4477153,20 16,20 Z M8,20 C8.55228475,20 9,19.5522847 9,19 C9,18.4477153 8.55228475,18 8,18 C7.44771525,18 7,18.4477153 7,19 C7,19.5522847 7.44771525,20 8,20 Z" />
                                </svg>
                                Add to Cart
                            </button>
                        ) : (
                            <div className="relative">
                                {/* Remove confirmation popup */}
                                {showRemovePopup && (
                                    <div
                                        ref={popupRef}
                                        className="absolute bottom-full left-0 right-0 mb-2.5 animate-scale-in z-20"
                                    >
                                        <div
                                            className="rounded-xl border p-3 shadow-lg"
                                            style={{ background: "#fff8f5", borderColor: "#f9cbb3" }}
                                        >
                                            <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: "#c44e1e" }}><svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Cart will be empty!</p>
                                            <p className="text-[10px] mb-2.5 leading-relaxed" style={{ color: "#8c7e74" }}>
                                                Last item — removing clears your cart.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { dispatch(decrementQuantity(product.id)); setShowRemovePopup(false); }}
                                                    className="flex-1 rounded-lg py-1.5 text-[10px] font-bold text-white cursor-pointer"
                                                    style={{ background: "#e8622a" }}
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    onClick={() => setShowRemovePopup(false)}
                                                    className="flex-1 rounded-lg border py-1.5 text-[10px] font-bold cursor-pointer"
                                                    style={{ borderColor: "#d4c9be", color: "#5a4e46" }}
                                                >
                                                    Keep
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <div
                                                className="h-2 w-2 rotate-45 -mt-1 border-b border-r"
                                                style={{ background: "#fff8f5", borderColor: "#f9cbb3" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="flex items-center justify-between rounded-xl border px-3 py-1.5 bg-[#fffdfb] border-[#ede8e2]"
                                >
                                    <button
                                        id={`decrement-card-${product.id}`}
                                        onClick={handleDecrement}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-base font-bold transition-all active:scale-90 cursor-pointer hover:bg-rose-50 hover:text-rose-600 border border-[#ede8e2]"
                                        style={{
                                            background: quantityInCart === 1 ? "#ffebe2" : "#ffffff",
                                            color: quantityInCart === 1 ? "#e8622a" : "#2c2420",
                                        }}
                                    >
                                        −
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-extrabold" style={{ color: "#2c2420" }}>{quantityInCart}</span>
                                        <span className="text-[9px]" style={{ color: "#e8622a" }}>in cart</span>
                                    </div>
                                    <button
                                        id={`increment-card-${product.id}`}
                                        onClick={() => dispatch(incrementQuantity(product.id))}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-base font-bold transition-all active:scale-90 cursor-pointer hover:bg-[#fff3ed] hover:text-[#e8622a] border border-[#ede8e2] bg-white text-[#2c2420]"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

export default ProductCard;