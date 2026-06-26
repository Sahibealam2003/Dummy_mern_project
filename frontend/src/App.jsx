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


function AppContent({ isCartOpen, setIsCartOpen }) {

  const dispatch = useDispatch();

  const location = useLocation();


  const isDealsPage = location.pathname === "/todays-deals";


  const [showFooter, setShowFooter] = useState(true);

  const [showNavbar, setShowNavbar] = useState(true);



  const { isLoggedIn, user } = useSelector(
    (state) => state.auth
  );


  const isAdmin =
    isLoggedIn && user?.role === "admin";



  React.useEffect(() => {

    if (!isAdmin) {

      dispatch(fetchCart());

    }

  }, [
    isLoggedIn,
    isAdmin,
    dispatch
  ]);

  React.useEffect(() => {

  const unsubscribe = onMessage(
    messaging,
    (payload) => {

      console.log(
        "Message received:",
        payload
      );


      if(Notification.permission === "granted"){

        new Notification(
          payload.notification?.title,
          {
            body: payload.notification?.body
          }
        );

      }

    }
  );


  return () => unsubscribe();


}, []);



  React.useEffect(() => {


    const hidePages = [
      "/checkout",
      "/login",
      "/signup",
      "/admin",
      "/forgot-password"
    ];


    setShowFooter(
      !hidePages.includes(location.pathname)
    );


    setShowNavbar(
      location.pathname !== "/admin"
    );


  }, [location.pathname]);




  React.useEffect(() => {

    window.scrollTo(0, 0);

  }, [location.pathname]);




  return (

    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#f5f3ef" }}
    >


      {
        showNavbar &&
        <Navbar
          onCartOpen={() => setIsCartOpen(true)}
        />
      }



      <main

        className={
          isDealsPage
            ?
            "flex-1 flex items-center justify-center p-4"
            :
            "flex-1"
        }


        style={{
          paddingTop:
            location.pathname === "/admin"
              ?
              0
              :
              (
                location.pathname === "/login" ||
                location.pathname === "/signup" ||
                location.pathname === "/forgot-password"
              )
                ?
                76
                :
                104

        }}

      >



        <Routes>


          <Route path="/" element={<ProductList />} />

          <Route path="/products" element={<ProductList />} />


          <Route
            path="/todays-deals"
            element={<TodaysDeals />}
          />


          <Route
            path="/trending-products"
            element={<TrendingProducts />}
          />


          <Route
            path="/special-offers"
            element={<SpecialOffers />}
          />


          <Route
            path="/login"
            element={<Login />}
          />


          <Route
            path="/signup"
            element={<Signup />}
          />


          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />


          <Route
            path="/admin"
            element={<AdminPanel />}
          />


          <Route
            path="/orders"
            element={<OrderHistory />}
          />


          <Route
            path="/wishlist"
            element={<Wishlist />}
          />



          <Route

            path="/checkout"

            element={

              <Checkout

                onHideFooter={() =>
                  setShowFooter(false)
                }


                onShowFooter={() =>
                  setShowFooter(true)
                }

              />

            }

          />



          <Route
            path="/categories"
            element={
              <DummyPage
                title="Categories"
              />
            }
          />



          <Route
            path="/about"
            element={
              <DummyPage
                title="About Us"
              />
            }
          />



          <Route
            path="/contact"
            element={
              <DummyPage
                title="Contact Us"
              />
            }
          />


        </Routes>


      </main>



      {
        !isDealsPage &&
        showFooter &&
        <Footer />
      }

      {
        !isAdmin &&
        <Cart
          isOpen={isCartOpen}
          onClose={() =>
            setIsCartOpen(false)
          }
        />
      }
    </div>

  )

}





function App() {

  const [
    isCartOpen,
    setIsCartOpen
  ] = useState(false);






  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "BPs5qx2DhTCj4bPnpK3U97GrDxwS_NULttwN7wn1QzM0SS4lLx9jiJFMKMCyswDuqH_JgNzJPRDcaMmAluCnuuw"
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

  return (
    <BrowserRouter>
      <button
        onClick={requestPermission}
        className="fixed  right-5 z-50 bg-black text-white text-[10px] font-semibold px-2 py-2 rounded shadow-md hover:bg-zinc-800 transition-colors duration-200"
      >
        Enable Notification
      </button>

    

      <AppContent
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />
    </BrowserRouter>
  )


}


export default App;