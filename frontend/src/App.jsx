import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { sendFToken } from "./services/authApi";
import { fetchCart } from "./reducers/cartSlice";
import ProductList from "./components/ProductList";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import TodaysDeals from "./components/TodaysDeals";
import TrendingProducts from "./components/TrendingProducts";
import SpecialOffers from "./components/SpecialOffers";
import Checkout from "./components/Checkout";
import OrderHistory from "./components/OrderHistory";
import Wishlist from "./components/Wishlist";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import DummyPage from "./components/DummyPage";
import AdminPanel from "./components/AdminPanel";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";
import { useEffect } from "react";
import { initiateSocket, disconnectSocket } from "./services/socket";
function AppContent({ isCartOpen, setIsCartOpen }) {
  const dispatch = useDispatch();

  const location = useLocation();

  const isDealsPage = location.pathname === "/todays-deals";

  const [showFooter, setShowFooter] = useState(true);

  const [showNavbar, setShowNavbar] = useState(true);

  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const isAdmin = isLoggedIn && user?.role === "admin";
  const [message, setMessage] = useState("");
  // State for notification
  const [fcmNotification, setFcmNotification] = useState(null);
  const [socketNotification, setSocketNotification] = useState(null);
  React.useEffect(() => {
    if (!isAdmin) {
      dispatch(fetchCart());
    }
  }, [isLoggedIn, isAdmin, dispatch]);

  React.useEffect(() => {
    const unsubscribe = 
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      // Set toast state
      setFcmNotification({
        title: payload.data.title || "Notification",
        body: payload.data.body || "",
      });
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (fcmNotification) {
      // Clear toast timeout
      const timer = setTimeout(() => {
        setFcmNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fcmNotification]);

  React.useEffect(() => {
    const hidePages = [
      "/checkout",
      "/login",
      "/signup",
      "/admin",
      "/forgot-password",
    ];

    setShowFooter(!hidePages.includes(location.pathname));

    setShowNavbar(location.pathname !== "/admin");
  }, [location.pathname]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    let socketInstance = null;
    const userId = user?.id || user?._id;
    if (isLoggedIn && userId) {
      socketInstance = initiateSocket(userId);

      if (socketInstance) {
        socketInstance.on("newOrder", (data) => {
          setSocketNotification({
            title: "Order Placed",
            body: data?.message || "Your order is created",
          });
        });

        socketInstance.on("orderStatusUpdate", (data) => {
          setSocketNotification({
            title: "Order Update",
            body: data.message,
          });
        });

        socketInstance.on("crmNotification", (data) => {
          setSocketNotification({
            title: data.title || "Notification",
            body: data.body || data.message || "",
          });
        });
      }
    } else {
      disconnectSocket();
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("newOrder");
        socketInstance.off("orderStatusUpdate");
        socketInstance.off("crmNotification");
      }
      disconnectSocket();
    };
  }, [isLoggedIn, user]);

  React.useEffect(() => {
    if (socketNotification) {
      const timer = setTimeout(() => {
        setSocketNotification(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [socketNotification]);
  return (
    <div
      className="flex min-h-screen flex-col relative"
      style={{ background: "#f5f3ef" }}
    >
      {socketNotification && (
        <div className="fixed top-48 right-6 z-[9999] max-w-sm w-full bg-white/95 backdrop-blur-md border border-indigo-100 rounded-xl shadow-2xl p-4 flex items-start space-x-3 transition-all duration-300">
          <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 p-2 rounded-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {socketNotification.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed break-words">
              {socketNotification.body}
            </p>
          </div>
          <div className="flex-shrink-0 flex">
            <button
              onClick={() => setSocketNotification(null)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Premium toast notification */}
      {fcmNotification && (
        <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-2xl p-4 flex items-start space-x-3 transition-all duration-300">
          <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 p-2 rounded-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {fcmNotification.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed break-words">
              {fcmNotification.body}
            </p>
          </div>
          <div className="flex-shrink-0 flex">
            <button
              onClick={() => setFcmNotification(null)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {showNavbar && <Navbar onCartOpen={() => setIsCartOpen(true)} />}

      <main
        className={
          isDealsPage ? "flex-1 flex items-center justify-center p-4" : "flex-1"
        }
        style={{
          paddingTop:
            location.pathname === "/admin"
              ? 0
              : location.pathname === "/login" ||
                  location.pathname === "/signup" ||
                  location.pathname === "/forgot-password"
                ? 76
                : 104,
        }}
      >
        <Routes>
          <Route path="/" element={<ProductList />} />

          <Route path="/products" element={<ProductList />} />

          <Route path="/todays-deals" element={<TodaysDeals />} />

          <Route path="/trending-products" element={<TrendingProducts />} />

          <Route path="/special-offers" element={<SpecialOffers />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<AdminPanel />} />

          <Route path="/orders" element={<OrderHistory />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route
            path="/checkout"
            element={
              <Checkout
                onHideFooter={() => setShowFooter(false)}
                onShowFooter={() => setShowFooter(true)}
              />
            }
          />

          <Route
            path="/categories"
            element={<DummyPage title="Categories" />}
          />

          <Route path="/about" element={<DummyPage title="About Us" />} />

          <Route path="/contact" element={<DummyPage title="Contact Us" />} />
        </Routes>
      </main>

      {!isDealsPage && showFooter && <Footer />}

      {!isAdmin && (
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // const requestPermission = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();

  //     if (permission === "granted") {
  //       const token = await getToken(messaging, {
  //         vapidKey:
  //           "BPs5qx2DhTCj4bPnpK3U97GrDxwS_NULttwN7wn1QzM0SS4lLx9jiJFMKMCyswDuqH_JgNzJPRDcaMmAluCnuuw",
  //       });
  //       console.log("FCM TOKEN:", token);
  //       await sendFToken(token);
  //       console.log("FCM Token saved to backend successfully");
  //     } else {
  //       console.log("Notification permission denied");
  //     }
  //   } catch (error) {
  //     console.log("Firebase Error:", error);
  //   }
  // };

  return (
    <>
      <BrowserRouter>
        <AppContent isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      </BrowserRouter>
    </>
  );
}

export default App;
