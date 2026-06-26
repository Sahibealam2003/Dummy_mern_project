import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { cancelOrderApi, deleteOrderApi, getMyOrders } from "../services/api";
import { generateInvoice } from "../utils/generateInvoice";

const OrderHistory = () => {
    const { isLoggedIn } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate();
    console.log(orders)
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login?redirect=/orders");
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch order history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isLoggedIn, navigate]);

    const handleCancelOrder = async (orderId) => {
        setIsOpen(true)

        try {
            const data = await cancelOrderApi(orderId);
            if (data.success) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, orderStatus: "Cancelled" } : order
                    )
                );
            }
        } catch (err) {
            console.error("Failed to cancel order:", err);
            alert(err.response?.data?.error || "Failed to cancel order");
        }
    };

    const handleDeleteOrder = async(orderId) =>{
        setIsOpen(true)
        try {
            const data = await deleteOrderApi(orderId);
            if(data.success){
                setOrders((prev) =>
                    prev.filter((order) => order._id !== orderId)
                );
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
            alert(error.response?.data?.error || "Failed to delete order");
        }
    }

    // Return badge style based on order status
    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200/60";
            case "Placed":
                return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
            case "Processing":
                return "bg-blue-50 text-blue-700 border-blue-200/60";
            case "Shipped":
                return "bg-purple-50 text-purple-700 border-purple-200/60";
            case "Delivered":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
            case "Cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200/60";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200/60";
        }
    };

    // Return stepper progress index
    const getStatusProgressWidth = (status) => {
        switch (status) {
            case "Pending":
                return "w-1/5";
            case "Placed":
                return "w-2/5";
            case "Processing":
                return "w-3/5";
            case "Shipped":
                return "w-4/5";
            case "Delivered":
                return "w-full";
            default:
                return "w-0";
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-32 text-center animate-fade-in">
                <div className="flex flex-col items-center gap-5">
                    <svg className="h-12 w-12 animate-spin text-[#e8622a]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm font-semibold text-[#8c7e74]">Loading your order history...</p>
                </div>
            </div>
        );
    }

    const uniqueCategories = ["All", ...new Set(orders.flatMap(order =>
        order.orderItems.map(item => item.product?.category).filter(Boolean)
    ))];

    const filteredOrders = orders.filter((order) => {
        const query = searchQuery.toLowerCase();
        const matchId = order.orderNumber?.toLowerCase().includes(query);
        const matchCategory = selectedCategory === "All" || order.orderItems?.some(item =>
            item.product?.category === selectedCategory
        );
        return matchId && matchCategory;
    });

    return (
        <div style={{ background: "#f5f3ef", minHeight: "100vh" }} className="pb-16 pt-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#2c2420] tracking-tight">My Orders</h1>
                        <p className="text-sm text-[#8c7e74] mt-1">Track and manage your order history.</p>
                    </div>
                    {orders.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search by Order ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-[#ede8e2] bg-white pl-10 pr-4 py-2 text-sm text-[#2c2420] placeholder-[#a69c93] shadow-sm outline-none focus:border-[#e8622a] focus:ring-2 focus:ring-[#e8622a]/20 transition-all"
                                />
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a69c93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-[#ede8e2] bg-white pl-4 pr-10 py-2 text-sm text-[#2c2420] shadow-sm outline-none focus:border-[#e8622a] focus:ring-2 focus:ring-[#e8622a]/20 transition-all cursor-pointer"
                                >
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a69c93] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-3xl border border-[#ede8e2] bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-[#8c7e74] mb-6">
                            <svg className="h-8 w-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-[#2c2420]">No orders found</h2>
                        <p className="mt-1.5 text-xs text-[#8c7e74] max-w-xs mx-auto">
                            It looks like you haven't placed any orders yet. Check out our latest products!
                        </p>
                        <Link
                            to="/"
                            className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#e8622a]/10 hover:opacity-95 transition-all"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-3xl border border-[#ede8e2] bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-[#8c7e74] mb-6">
                            <svg className="h-8 w-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-[#2c2420]">No matching orders</h2>
                        <p className="mt-1.5 text-xs text-[#8c7e74] max-w-xs mx-auto">
                            Try adjusting your search query.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="overflow-hidden rounded-3xl border border-[#ede8e2] bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
                            >
                                {/* Card Header */}
                                <div className="border-b border-[#f5f3ef] bg-[#faf9f6] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Order Placed</span>
                                            <span className="font-semibold text-[#2c2420]">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Order ID</span>
                                            <span className="font-mono font-bold text-[#2c2420]">{order.orderNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Ship To</span>
                                            <span className="font-semibold text-[#2c2420] truncate block max-w-[120px]" title={order.shippingAddress?.address}>
                                                {order.shippingAddress?.city}
                                            </span>
                                        </div>

                                    </div>
                                    <div className="flex items-center gap-3">

                                        {
                                            order.orderStatus === "Cancelled" || order.orderStatus == "Delivered" ? (

                                                <button
                                                    onClick={() => {

                                                        handleDeleteOrder(order._id)

                                                    }}
                                                    className="text-xs font-bold text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>


                                            ) : (

                                                ["Pending", "Placed", "Processing"].includes(order.orderStatus) && (

                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        className="text-xs font-bold text-orange-600 hover:text-orange-800"
                                                    >
                                                        Cancel
                                                    </button>

                                                )

                                            )
                                        }

                                        {order.orderStatus == "Delivered" && (
                                            <button
                                                onClick={() => generateInvoice(order)}
                                                disabled={order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled"}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-white shrink-0 transition-all ${order.orderStatus === "Delivered" || order.orderStatus === "Cancelled"
                                                    ? "border-[#ede8e2] text-[#8c7e74] hover:border-[#e8622a] hover:text-[#e8622a] hover:bg-[#fff3ed] active:scale-95 cursor-pointer"
                                                    : "border-[#ede8e2] text-[#d1ccc7] opacity-50 cursor-not-allowed"
                                                    }`}
                                                title={order.orderStatus === "Delivered" || order.orderStatus === "Cancelled" ? "Download Invoice PDF" : "Invoice available upon delivery or cancellation"}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7e74] block mb-0.5">Total Paid</span>
                                            <span className="font-extrabold text-[#e8622a] text-sm">${order.totalPrice.toFixed(2)}</span>
                                        </div>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${getStatusStyle(
                                                order.orderStatus
                                            )}`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Items list */}
                                <div className="px-5 py-4 divide-y divide-[#f5f3ef]">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 text-xs">
                                            <div className="h-14 w-14 rounded-xl border border-[#ede8e2] bg-white p-1 flex items-center justify-center shrink-0">
                                                <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-[#2c2420] truncate">{item.title}</h4>
                                                <p className="text-[#8c7e74] mt-0.5">Quantity: {item.quantity} · ${item.price.toFixed(2)} each</p>
                                            </div>
                                            <span className="font-bold text-[#2c2420] shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Stepper */}
                                <div className="border-t border-[#f5f3ef] bg-[#fdfbf9] px-5 py-5 text-[10px]">
                                    <div className="relative mb-2">
                                        {/* Background track */}
                                        <div className={`${order.orderStatus === "Cancelled" ? "absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-red-600 rounded-full" : "absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-[#ede8e2] rounded-full"}`} />
                                        {/* Active track */}
                                        <div
                                            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-[#e8622a] to-[#c44e1e] rounded-full transition-all duration-500 ${getStatusProgressWidth(
                                                order.orderStatus
                                            )}`}
                                        />

                                        {/* Steps */}
                                        <div className="relative flex justify-between">
                                            {["Pending", "Placed", "Processing", "Shipped", "Delivered"].map((st, i) => {
                                                const statuses = ["Pending", "Placed", "Processing", "Shipped", "Delivered"];
                                                const currentIdx = statuses.indexOf(order.orderStatus);
                                                const isCompleted = i <= currentIdx;
                                                return (
                                                    <div key={st} className="flex flex-col items-center">
                                                        <div
                                                            className={`flex h-4 w-4 items-center justify-center rounded-lg border-2 transition-all duration-300 bg-white ${isCompleted
                                                                ? "border-[#e8622a] text-[#e8622a] scale-110"
                                                                : "border-[#ede8e2]"
                                                                }`}
                                                        >   {order.orderStatus === "Cancelled" && (
                                                            <div className="h-25px w-25px rounded-full bg-red-600" >
                                                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                                            </div>
                                                        )}
                                                            {isCompleted && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-[#e8622a]" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex justify-between font-bold text-[#8c7e74] tracking-wider uppercase scale-95 origin-left text-center">
                                        <span className={`w-1/5 ${order.orderStatus === "Pending" ? "text-[#e8622a]" : ""}`}>Pending</span>
                                        <span className={`w-1/5 ${order.orderStatus === "Placed" ? "text-[#e8622a]" : ""}`}>Placed</span>
                                        <span className={`w-1/5 ${order.orderStatus === "Processing" ? "text-[#e8622a]" : ""}`}>Processing</span>
                                        <span className={`w-1/5 ${order.orderStatus === "Shipped" ? "text-[#e8622a]" : ""}`}>Shipped</span>
                                        <span className={`w-1/5 ${order.orderStatus === "Delivered" ? "text-emerald-600" : ""}`}>Delivered</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
