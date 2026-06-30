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

import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";
import { useEffect } from "react";
import { io } from "socket.io-client";
function AppContent({ isCartOpen, setIsCartOpen, onChatOpen }) {
  const dispatch = useDispatch();

  const location = useLocation();

  const isDealsPage = location.pathname === "/todays-deals";

  const [showFooter, setShowFooter] = useState(true);

  const [showNavbar, setShowNavbar] = useState(true);

  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const isAdmin = isLoggedIn && user?.role === "admin";

  React.useEffect(() => {
    if (!isAdmin) {
      dispatch(fetchCart());
    }
  }, [isLoggedIn, isAdmin, dispatch]);

  React.useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received:", payload);

      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title, {
          body: payload.notification?.body,
        });
      }
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#f5f3ef" }}
    >
      {showNavbar && (
        <Navbar
          onCartOpen={() => setIsCartOpen(true)}
          onChatOpen={onChatOpen}
        />
      )}

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

const socket = io("http://localhost:8080");

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [ws, setWs] = useState(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);
    socket.onmessage=(event)=>{
      console.log(event.data)
    }
  }, []);

  const send=()=>{
    ws.send("Hello from client")
  }
  //For socket.io lib
  // const [message, setMessage] = useState("");
  // const [chat, setChat] = useState([]);

  // useEffect(() => {
  //   socket.on("receiveMessage", (data) => {
  //     setChat((prev) => [...prev, data]);
  //   });
  // }, []);

  // const sendMessage=()=>{
  //   socket.emit("sendMessage",message)
  //   setMessage("")
  // }
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey:
            "BPs5qx2DhTCj4bPnpK3U97GrDxwS_NULttwN7wn1QzM0SS4lLx9jiJFMKMCyswDuqH_JgNzJPRDcaMmAluCnuuw",
        });
        console.log("FCM TOKEN:", token);
        await sendFToken(token);
        console.log("FCM Token saved to backend successfully");
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.log("Firebase Error:", error);
    }
  };
  //Without websocket
  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:8080");

  //   ws.onopen = () => {
  //     console.log("WebSocket Connected");

  //     ws.send("Hello Backend");
  //   };

  //   ws.onmessage = (event) => {
  //     console.log("Backend Response:", event.data);
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  return (
    <>
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#f5f3ef] rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-[#ede8e2]">
            <button
              onClick={() => setIsChatModalOpen(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 font-black text-xl cursor-pointer transition-colors"
            >
              &times;
            </button>
            <h2 className="text-lg font-black text-[#2c2420] mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-[#e8622a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Live Chat
            </h2>
            {/* <div className="h-64 overflow-y-auto border border-[#ede8e2] rounded-xl p-4 bg-white/70 mb-4 flex flex-col gap-2.5 shadow-inner">
              {chat.length === 0 ? (
                <div className="text-center text-xs text-stone-400 my-auto py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chat.map((msg, index) => (
                  <div
                    key={index}
                    className="bg-stone-100 border border-stone-200/60 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-xs font-semibold text-[#2c2420] max-w-[85%] self-start shadow-sm leading-relaxed"
                  >
                    {msg}
                  </div>
                ))
              )}
            </div> */}
            <div className="flex gap-2">
              {/* <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-[#ede8e2] rounded-xl text-xs bg-white focus:outline-none focus:border-[#e8622a]/50 placeholder-stone-400 font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              /> */}
              <button
                onClick={send}
                className="bg-gradient-to-r from-[#e8622a] to-[#c44e1e] hover:scale-[1.02] active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-[#e8622a]/15"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <BrowserRouter>
        <AppContent
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          onChatOpen={() => setIsChatModalOpen(true)}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
