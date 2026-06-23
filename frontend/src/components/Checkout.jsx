import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCart } from "../reducers/cartSlice";
import { getAllSpecialOffers, createOrder } from "../services/api";

const FIELD_CLS = "w-full rounded-xl border border-[#e4dfd9] bg-[#fafafa] px-4 py-2 text-sm text-[#2c2420] placeholder-[#a69c93] outline-none focus:bg-[#fafafa] focus:border-[#e8622a] focus:ring-4 focus:ring-[#e8622a]/10 transition-all duration-200";
const LABEL_CLS = "block text-xs font-semibold uppercase tracking-wider text-[#8c7e74] mb-1.5";

const Checkout = ({ onHideFooter, onShowFooter }) => {
    const cartItems = useSelector((state) => state.cart.products);
    const totalCount = useSelector((state) => state.cart.totalCount);
    const totalPrice = useSelector((state) => state.cart.totalPrice);
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Form inputs
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [address, setAddress] = useState("");
    
    // Special Offers state
    const [offers, setOffers] = useState([]);
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");

    // Promo code state
    const [promoInput, setPromoInput] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState("");

    // Checkout steps: 'form', 'processing', 'success'
    const [step, setStep] = useState("form");
    const [orderNumber, setOrderNumber] = useState("");
    const [orderSummarySnapshot, setOrderSummarySnapshot] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login?redirect=/checkout");
        } else if (user?.role === "admin") {
            navigate("/");
        }
    }, [isLoggedIn, user, navigate]);

    useEffect(() => {
        if (user) {
            setName((n) => n || user.name || "");
            setEmail((e) => e || user.email || "");
        }
    }, [user]);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await getAllSpecialOffers();
                setOffers(data);
            } catch (err) {
                console.error("Failed to load offers in Checkout:", err);
            }
        };
        fetchOffers();
    }, []);

    useEffect(() => {
        if (step === "processing" || step === "success") {
            if (onHideFooter) onHideFooter();
        } else {
            if (onShowFooter) onShowFooter();
        }
        return () => {
            if (onShowFooter) onShowFooter();
        };
    }, [step, onHideFooter, onShowFooter]);

    const getDeliveryEstimate = () => {
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 5);

        const options = { month: "short", day: "numeric", year: "numeric" };
        return `${minDate.toLocaleDateString("en-US", options)} - ${maxDate.toLocaleDateString("en-US", options)}`;
    };

    const handleCopyOrderNumber = () => {
        if (!orderNumber) return;
        navigator.clipboard.writeText(orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (step === "success" && orderSummarySnapshot) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12 text-center animate-scale-in">
                <div className="relative overflow-hidden rounded-3xl border border-[#ede8e2] bg-white p-8 md:p-12 shadow-md">
                    {/* Decorative Background Elements */}
                    <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#e8622a]/5 blur-3xl pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-[#c44e1e]/5 blur-3xl pointer-events-none" />

                    {/* Celebratory Icon */}
                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner mb-6">
                        <svg className="h-10 w-10 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="absolute -top-2 -left-2 animate-bounce" style={{ animationDelay: "0.1s" }}><svg className="h-6 w-6 text-[#e8622a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg></span>
                        <span className="absolute -bottom-2 -right-2 animate-bounce" style={{ animationDelay: "0.4s" }}><svg className="h-6 w-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></span>
                        <span className="absolute -top-1 -right-3 animate-bounce" style={{ animationDelay: "0.2s" }}><svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-[#2c2420]">
                        Congratulations, {orderSummarySnapshot.name}!
                    </h1>
                    <p className="mt-2 text-sm text-[#8c7e74] max-w-md mx-auto">
                        Your order has been placed successfully. A confirmation receipt has been sent to <span className="font-semibold text-[#2c2420]">{orderSummarySnapshot.email}</span>.
                    </p>

                    {/* Order Details Panel */}
                    <div className="my-8 rounded-2xl border border-dashed border-[#ede8e2] bg-[#fdfbf9] p-6 text-left space-y-4 shadow-sm">
                        {/* Order Number Row */}
                        <div className="flex justify-between items-center border-b border-[#f5f3ef] pb-3">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#8c7e74] block">Order ID</span>
                                <span className="font-mono font-bold text-sm text-[#2c2420]">{orderNumber}</span>
                            </div>
                            <button
                                onClick={handleCopyOrderNumber}
                                className="flex items-center gap-1.5 rounded-lg border border-[#ede8e2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2c2420] hover:bg-[#fdf9f5] active:scale-95 transition-all cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-emerald-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5 text-[#8c7e74]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        <span>Copy ID</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Shipping Destination</span>
                                <p className="font-semibold text-[#2c2420]">{orderSummarySnapshot.name}</p>
                                <p className="text-[#8c7e74] leading-relaxed mt-0.5">
                                    {orderSummarySnapshot.address}<br />
                                    {orderSummarySnapshot.city}, {orderSummarySnapshot.zip}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Estimated Arrival</span>
                                <p className="font-bold text-emerald-600 text-sm">{getDeliveryEstimate()}</p>
                                <span className="text-[10px] text-[#8c7e74] block mt-1">Standard Delivery (Free)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-[#f5f3ef] pt-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Payment Method</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-base"><svg className="h-4 w-4 text-[#8c7e74]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg></span>
                                    <span className="font-mono text-[#2c2420] font-semibold">
                                        Card ending in •••• {orderSummarySnapshot.cardLastFour}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Amount Charged</span>
                                <span className="text-base font-bold text-[#e8622a]">${orderSummarySnapshot.finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Items Purchased List Dropdown/Summary */}
                        <div className="border-t border-[#f5f3ef] pt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-2">Items Purchased</span>
                            <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                                {orderSummarySnapshot.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                        <span className="text-[#2c2420] font-medium truncate max-w-[280px]">
                                            {item.title} <span className="text-[#8c7e74] text-[10px] font-normal ml-1">x{item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-[#8c7e74] shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/"
                            className="btn-glow flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8622a]/20 hover:opacity-95 active:scale-[0.99] transition-all"
                        >
                            Back to Home
                        </Link>
                        <Link
                            to="/special-offers"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#ede8e2] bg-white py-3.5 text-sm font-bold text-[#2c2420] hover:bg-[#fdf9f5] active:scale-[0.99] transition-all"
                        >
                            Explore Coupons
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    if (step === "processing") {
        return (
            <div className="mx-auto max-w-md px-4 py-32 text-center animate-fade-in">
                <div className="flex flex-col items-center gap-5">
                    <svg className="h-12 w-12 animate-spin-slow text-[#e8622a]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-bold text-[#2c2420]">Processing Your Order</h3>
                        <p className="text-xs text-[#8c7e74] mt-1">Please do not refresh the page or click back.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in-up">
                <div className="rounded-3xl border border-[#ede8e2] bg-white p-12 shadow-sm">
                    <svg className="h-16 w-16 mx-auto text-[#8c7e74] mb-4 opacity-40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path fillRule="evenodd" d="M5.5597563,4.06047595 C5.72244345,4.02226023 5.89364684,4.00215745 6.07124705,4.0025413 L20.0407059,5.00035979 C21.2924207,5.02246314 22.5170562,6.06045128 21.9125093,7.4090559 C21.7947892,7.67166232 21.2632108,8.74107307 20.4179792,10.4238018 C20.0728954,11.1107569 19.7187748,11.8139176 19.3646624,12.5158735 C19.1640115,12.9135242 19.1640115,12.9135242 19.0223623,13.1940179 C18.9575266,13.3223602 18.9322538,13.3723877 18.9170252,13.4025252 C18.6296457,14.1416265 18.0226743,14.7125666 17.2644564,14.9531632 L17.1168546,15 L7.038,15 L7.0236919,14.9992614 L5.04955452,14.9987714 C4.48131071,15.0269651 4.02696511,15.4813107 4,16 L3.99820546,16.9401179 C4.0325365,17.5123999 4.49000831,17.9693908 5,18 L5.17070571,18 C5.58254212,16.8348076 6.69378117,16 8,16 C9.30621883,16 10.4174579,16.8348076 10.8292943,18 L13.1707057,18 C13.5825421,16.8348076 14.6937812,16 16,16 C17.6568542,16 19,17.3431458 19,19 C19,20.6568542 17.6568542,22 16,22 C14.6937812,22 13.5825421,21.1651924 13.1707057,20 L10.8292943,20 C10.4174579,21.1651924 9.30621883,22 8,22 C6.6933082,22 5.58173739,21.1645877 5.17025861,19.9987341 L4.94323901,19.9983878 C3.36275342,19.908533 2.09682123,18.6439315 2,17 L2.00122858,15.9504455 C2.08019762,14.3588245 3.3503557,13.0855742 4.98992,13.0005078 L4.01005051,6.14142136 L4,6 C4,5.35306206 3.67086363,4.58507719 3.29289322,4.20710678 C3.1948992,4.10911276 2.75844815,4 2,4 L2,2 C3.24155185,2 4.13843413,2.22422057 4.70710678,2.79289322 C5.0421564,3.12794284 5.33673938,3.56893407 5.5597563,4.06047595 Z M7.11287151,13 L16.7694281,13 C16.9028277,12.9273528 17.0065461,12.8077563 17.0587744,12.6622214 L17.1075574,12.548839 C17.131074,12.5023208 17.131074,12.5023208 17.2371473,12.2923487 C17.3785994,12.0122452 17.3785994,12.0122452 17.5790088,11.6150733 C17.9326498,10.9140516 18.2862826,10.2118596 18.6162844,9.55492931 L18.6307708,9.52609021 C19.2088812,8.37515943 19.6504574,7.49032194 19.8933745,6.9949252 L6.01025746,6.00073455 L6.99015389,12.8600168 C6.99973088,12.9277585 7.0486615,12.9821505 7.11287151,13 Z M16,20 C16.5522847,20 17,19.5522847 17,19 C17,18.4477153 16.5522847,18 16,18 C15.4477153,18 15,18.4477153 15,19 C15,19.5522847 15.4477153,20 16,20 Z M8,20 C8.55228475,20 9,19.5522847 9,19 C9,18.4477153 8.55228475,18 8,18 C7.44771525,18 7,18.4477153 7,19 C7,19.5522847 7.44771525,20 8,20 Z" />
                    </svg>
                    <h2 className="text-xl font-bold text-[#2c2420]">Your cart is empty</h2>
                    <p className="mt-1 text-sm text-[#8c7e74] max-w-xs mx-auto">
                        Add some high-quality items to your shopping cart to complete your checkout.
                    </p>
                    <Link
                        to="/"
                        className="btn-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2c2420] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#3d3028]"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    // Calculations
    const shipping = 0.0;
    const tax = totalPrice * 0.1;
    
    const getDiscountPercentage = () => {
        if (!promoApplied) return 0.0;
        const codeToApply = promoInput.trim().toUpperCase();
        const matchingOffer = offers.find(o => o.code === codeToApply);
        if (matchingOffer) {
            const match = matchingOffer.discount.match(/(\d+)%/);
            if (match) {
                return Number(match[1]) / 100;
            }
            if (matchingOffer.discount.toUpperCase().includes("FREE SHIPPING")) {
                return 0.0;
            }
        }
        if (codeToApply === "SHOP10") return 0.1;
        return 0.0;
    };

    const promoDiscount = promoApplied ? totalPrice * getDiscountPercentage() : 0.0;
    const finalTotal = totalPrice + tax + shipping - promoDiscount;

    const handleApplyPromo = (e) => {
        e.preventDefault();
        const codeToApply = promoInput.trim().toUpperCase();
        const matchingOffer = offers.find(o => o.code === codeToApply);
        if (matchingOffer || codeToApply === "SHOP10") {
            setPromoApplied(true);
            setPromoError("");
        } else {
            setPromoError("Invalid discount code!");
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setStep("processing");

        const cardLastFour = cardNumber.replace(/\s/g, "").slice(-4) || "••••";

        // Map cart items to the database structure
        const mappedItems = cartItems.map((item) => ({
            product: item.id || item._id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        const snapshot = {
            items: [...cartItems],
            totalPrice: totalPrice,
            finalTotal: finalTotal,
            shipping: shipping,
            tax: tax,
            promoDiscount: promoDiscount,
            promoApplied: promoApplied,
            name: name,
            email: email,
            address: address,
            city: city,
            zip: zip,
            cardLastFour
        };
        setOrderSummarySnapshot(snapshot);

        try {
            const res = await createOrder({
                orderItems: mappedItems,
                shippingAddress: {
                    address,
                    city,
                    zip
                },
                paymentInfo: {
                    status: "Paid",
                    cardLastFour,
                    paymentMethod: "Card"
                },
                totalPrice: finalTotal
            });

            if (res.success) {
                // Simulate a slight delay to feel natural/processing payment before success screen
                setTimeout(() => {
                    setOrderNumber(res.order.orderNumber);
                    setStep("success");
                    dispatch(clearCart());
                }, 1500);
            } else {
                setStep("form");
                alert(res.error || "Failed to place order. Please try again.");
            }
        } catch (err) {
            console.error("Checkout order placement error:", err);
            setStep("form");
            alert(err.response?.data?.error || "Failed to place order. Please check details and try again.");
        }
    };

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 animate-fade-in">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#2c2420]"><span className="inline-flex items-center gap-2"><svg className="h-5 w-5 text-[#e8622a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Secured Checkout</span></h2>
                    <p className="text-sm text-[#8c7e74] mt-0.5">Please fill in your shipping and payment details.</p>
                </div>

                <div className="mb-6 h-px" style={{ background: "#ede8e2" }} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Details */}
                    <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
                        {/* Shipping details */}
                        <div className="rounded-2xl border border-[#ede8e2] bg-white p-5 md:p-6 space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2c2420] border-b border-[#f5f3ef] pb-2.5 mb-1">
                                <svg className="h-5 w-5 inline-block mr-2 text-[#e8622a]" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="0" fill="none" width="24" height="24"/><g><path d="M18 8h-2V7c0-1.105-.895-2-2-2H4c-1.105 0-2 .895-2 2v10h2c0 1.657 1.343 3 3 3s3-1.343 3-3h4c0 1.657 1.343 3 3 3s3-1.343 3-3h2v-5l-4-4zM7 18.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zM4 14V7h10v7H4zm13 4.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/></g></svg> Shipping Information
                            </h3>
                            <div>
                                <label className={LABEL_CLS}>Full Name</label>
                                <input
                                    className={FIELD_CLS}
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Email Address</label>
                                <input
                                    className={FIELD_CLS}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Delivery Address</label>
                                <input
                                    className={FIELD_CLS}
                                    type="text"
                                    placeholder="Street Address, Apartment, Suite"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_CLS}>City</label>
                                    <input
                                        className={FIELD_CLS}
                                        type="text"
                                        placeholder="City Name"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>ZIP / Postal Code</label>
                                    <input
                                        className={FIELD_CLS}
                                        type="text"
                                        placeholder="10001"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment details */}
                        <div className="rounded-2xl border border-[#ede8e2] bg-white p-5 md:p-6 space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2c2420] border-b border-[#f5f3ef] pb-2.5 mb-1">
                                <svg className="h-5 w-5 inline-block mr-2 text-[#e8622a]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>

                                Payment Details
                            </h3>
                            <div>
                                <label className={LABEL_CLS}>Cardholder Name</label>
                                <input
                                    className={FIELD_CLS}
                                    type="text"
                                    placeholder="Name as it appears on your card"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Card Number</label>
                                <input
                                    className={FIELD_CLS}
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_CLS}>Expiration Date</label>
                                    <input
                                        className={FIELD_CLS}
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>CVV / CVC</label>
                                    <input
                                        className={FIELD_CLS}
                                        type="text"
                                        placeholder="123"
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <button
                            type="submit"
                            className="btn-glow flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8622a]/20 transition-all"
                        >
                            Place Order · ${finalTotal.toFixed(2)}
                        </button>
                    </form>

                    {/* Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Summary List */}
                        <div className="rounded-2xl border border-[#ede8e2] bg-white p-5 md:p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2c2420] border-b border-[#f5f3ef] pb-2.5">
                                <svg className="h-5 w-5 inline-block mr-2 text-[#e8622a]" width="800px" height="800px" viewBox="-5.25 0 50 50" xmlns="http://www.w3.org/2000/svg"><g id="Group_19" data-name="Group 19" transform="translate(-1219.44 -717.022)"><path id="Path_50" data-name="Path 50" d="M1256.94,765.022h-35.5v-46h21.25l14.25,15.75Z" fill="#ffffff" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/><path id="Path_51" data-name="Path 51" d="M1241.69,720.022v14.75h14.25" fill="#d1d3d4" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/><line id="Line_28" data-name="Line 28" x2="20.75" transform="translate(1227.69 757.272)" fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/><line id="Line_29" data-name="Line 29" x2="10.75" transform="translate(1227.69 749.272)" fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/></g></svg> Order Summary
                            </h3>

                            {/* Items Scroll area */}
                            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center text-xs">
                                        <div className="h-12 w-12 rounded-lg border border-[#ede8e2] bg-white p-1 flex items-center justify-center shrink-0">
                                            <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-[#2c2420] truncate">{item.title}</p>
                                            <p className="text-[#8c7e74] mt-0.5">Qty: {item.quantity} · ${item.price.toFixed(2)} each</p>
                                        </div>
                                        <span className="font-bold text-[#2c2420] shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-[#ede8e2] my-4" />

                            {/* Apply Promo Form */}
                            <form onSubmit={handleApplyPromo} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Promo Code(optional)"
                                    className="flex-1 rounded-xl border border-[#ede8e2] bg-white px-3 py-2 text-xs text-[#2c2420] placeholder-[#bcae9e] outline-none"
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value)}
                                    disabled={promoApplied}
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#2c2420] px-4 py-2 text-xs font-bold text-white hover:bg-[#3d3028] disabled:opacity-50 cursor-pointer shrink-0"
                                    disabled={promoApplied || !promoInput.trim()}
                                >
                                    Apply
                                </button>
                            </form>
                            {promoApplied && (
                                <p className="text-[10px] font-bold text-emerald-600">✓ SHOP10 Code Applied (10% Discount)!</p>
                            )}
                            {promoError && (
                                <p className="text-[10px] font-bold text-rose-500">{promoError}</p>
                            )}

                            <div className="h-px bg-[#ede8e2] my-4" />

                            {/* Price Breakdown */}
                            <div className="space-y-2.5 text-xs text-[#8c7e74]">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalCount} item{totalCount !== 1 ? "s" : ""})</span>
                                    <span className="font-semibold text-[#2c2420]">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-bold text-[#2c7a4a]">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (10%)</span>
                                    <span className="font-semibold text-[#2c2420]">${tax.toFixed(2)}</span>
                                </div>
                                {promoApplied && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Promo Discount (10%)</span>
                                        <span>-${promoDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gradient-to-r from-transparent via-[#ede8e2] to-transparent my-1" />
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-[#2c2420]">Total</span>
                                    <span className="text-lg text-[#e8622a]">
                                        ${finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
