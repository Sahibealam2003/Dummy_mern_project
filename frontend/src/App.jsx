import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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



function AppContent({ isCartOpen, setIsCartOpen }) {
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
    const isSpecialPage = ["/checkout", "/login", "/signup", "/admin", "/forgot-password"].includes(location.pathname);
    setShowFooter(!isSpecialPage);
    setShowNavbar(location.pathname !== "/admin");
  }, [location.pathname]);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#f5f3ef" }}>
      {showNavbar && <Navbar onCartOpen={() => setIsCartOpen(true)} />}
      {/* Two-row navbar = 104px (64px top + 40px secondary) */}
      <main 
        className={isDealsPage ? "flex-1 flex items-center justify-center p-4" : "flex-1"} 
        style={{ paddingTop: location.pathname === "/admin" ? 0 : (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/forgot-password") ? 76 : 104 }}
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
          {/* Dummy Pages for footer links */}
          <Route path="/categories" element={<DummyPage title="Categories" description="Explore our wide range of product categories." />} />
          <Route path="/featured" element={<DummyPage title="Featured Products" description="Handpicked premium collections for you." />} />
          <Route path="/about" element={<DummyPage title="About Us" description="Learn more about our company, values, and mission." />} />
          <Route path="/careers" element={<DummyPage title="Careers" description="Join our team and build the future of e-commerce." />} />
          <Route path="/blog" element={<DummyPage title="Blog & News" description="The latest articles, updates, and shopping trends." />} />
          <Route path="/press-kit" element={<DummyPage title="Press Kit" description="Official resources, logos, and media contact info." />} />
          <Route path="/documentation" element={<DummyPage title="Documentation" description="Developer APIs, guides, and integration tutorials." />} />
          <Route path="/help-center" element={<DummyPage title="Help Center" description="Find answers to frequently asked questions and support guides." />} />
          <Route path="/contact" element={<DummyPage title="Contact Us" description="Get in touch with our customer service and support team." />} />
          <Route path="/status" element={<DummyPage title="System Status" description="Real-time status of our services, APIs, and deliveries." />} />
          <Route path="/privacy-policy" element={<DummyPage title="Privacy Policy" description="How we handle, secure, and protect your personal information." />} />
          <Route path="/terms-of-service" element={<DummyPage title="Terms of Service" description="The terms, rules, and conditions for using our platform." />} />
          <Route path="/cookie-policy" element={<DummyPage title="Cookie Policy" description="Details about how we use cookies to improve your browsing experience." />} />
          <Route path="/licenses" element={<DummyPage title="Licenses" description="Open source libraries, attributions, and legal licensing." />} />
        </Routes>
      </main>
      {!isDealsPage && showFooter && <Footer />}
      {!isAdmin && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <AppContent isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </BrowserRouter>
  );
}

export default App;
