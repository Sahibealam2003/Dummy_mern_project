import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { getSocket } from "../services/socket";
import {
  getAllProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getAllSpecialOffers,
  createSpecialOfferApi,
  updateSpecialOfferApi,
  deleteSpecialOfferApi,
  getAllOrders,
  updateOrderStatus,
  getAllUsersApi,
  updateUserRoleApi,
  deleteUserApi,
  sendCrmEmailApi,
  sendCrmNotificationApi,
} from "../services/api";
import { Dashboard } from "./dashboard";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Settings,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  HelpCircle,
  ShoppingCart,
  Users,
  Mail,
  Send,
  Trash2,
  ShieldAlert,
} from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { label: "Products", icon: ShoppingBag, to: "/admin?tab=products" },
    { label: "Special Offers", icon: Tag, to: "/admin?tab=offers" },
    { label: "Orders", icon: ShoppingCart, to: "/admin?tab=orders" },
    { label: "Customers", icon: Users, to: "/admin?tab=crm" },
  ];

  const [activeTab, setActiveTab] = useState("dashboard");

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Product Form Fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Special Offers State
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);

  // Offer Form Fields
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerExpiry, setOfferExpiry] = useState("");
  const [offerTag, setOfferTag] = useState("");
  const [offerIcon, setOfferIcon] = useState("");
  const [offerColor, setOfferColor] = useState("#e8622a");
  const [offerBg, setOfferBg] = useState("#fff3ed");

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // CRM (Users) States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [crmModalOpen, setCrmModalOpen] = useState(false);
  const [currentCrmUser, setCurrentCrmUser] = useState(null);
  const [crmSearch, setCrmSearch] = useState("");
  const [crmSegmentTab, setCrmSegmentTab] = useState("all"); // all, vip, regular, new

  // CRM Messaging states
  const [crmMessageModalOpen, setCrmMessageModalOpen] = useState(false);
  const [crmMessageType, setCrmMessageType] = useState("email"); // email, notification, both
  const [crmMessageSubject, setCrmMessageSubject] = useState("");
  const [crmMessageBody, setCrmMessageBody] = useState("");
  const [crmMessageTarget, setCrmMessageTarget] = useState("single"); // single, segment
  const [crmMessageTargetUser, setCrmMessageTargetUser] = useState(null);
  const [crmMessageTargetSegment, setCrmMessageTargetSegment] = useState("all"); // all, vip, regular, new

  // Global form feedback states
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "product", "offer" or "user"
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const adminPanelRef = useRef(null);

  // Stagger transition on tab change or CRM segment selection change
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".admin-tab-content-anim",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
      );

      if (activeTab === "crm") {
        gsap.fromTo(
          ".crm-row-anim",
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.04,
            ease: "power1.out",
            delay: 0.1,
          },
        );
      }
    }, adminPanelRef);
    return () => ctx.revert();
  }, [activeTab, crmSegmentTab]);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "admin") {
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "products") {
      setActiveTab("products");
    } else if (tab === "offers") {
      setActiveTab("offers");
    } else if (tab === "orders") {
      setActiveTab("orders");
    } else if (tab === "crm") {
      setActiveTab("crm");
    } else {
      setActiveTab("dashboard");
    }
    setError("");
    setSuccess("");
  }, [window.location.search]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await getAllProducts({ limit: 1000 });
      setProducts(data.products || data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      const data = await getAllSpecialOffers();
      setOffers(data);
    } catch (err) {
      console.error("Failed to load special offers:", err);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getAllUsersApi();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users for CRM:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.role === "admin") {
      fetchProducts();
      fetchOffers();
      fetchOrders();
      fetchUsers();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") return;

    const socket = getSocket();

    console.log("Socket =", socket);
    console.log("Socket connected =", socket?.connected);
    if (!socket) return;

    const handleNewOrder = (order) => {
      console.log("Before:", orders.length);

      setOrders((prev) => {
        console.log("Prev =", prev.length);
        return [order, ...prev];
      });

      console.log("After event");
    };

    socket.on("new-order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
    };
  }, [isLoggedIn, user]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (
      productModalOpen ||
      offerModalOpen ||
      deleteModalOpen ||
      crmModalOpen ||
      crmMessageModalOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    productModalOpen,
    offerModalOpen,
    deleteModalOpen,
    crmModalOpen,
    crmMessageModalOpen,
  ]);

  // Product Modal Helpers
  const openCreateProductModal = () => {
    setCurrentProduct(null);
    setTitle("");
    setPrice("");
    setCategory("electronics");
    setDescription("");
    setImage("");
    setError("");
    setSuccess("");
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setCurrentProduct(product);
    setTitle(product.title);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description);
    setImage(product.image);
    setError("");
    setSuccess("");
    setProductModalOpen(true);
  };

  const triggerProductDelete = (product) => {
    setDeleteItem(product);
    setDeleteType("product");
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    setDeleteError("");
    const id = deleteItem.id || deleteItem._id;
    try {
      if (deleteType === "product") {
        await deleteProductApi(id);
        setProducts(products.filter((p) => p.id !== id && p._id !== id));
      } else if (deleteType === "offer") {
        await deleteSpecialOfferApi(id);
        setOffers(offers.filter((o) => o.id !== id && o._id !== id));
      } else if (deleteType === "user") {
        await deleteUserApi(id);
        setUsers(users.filter((u) => u.id !== id && u._id !== id));
      }
      setDeleteModalOpen(false);
      setDeleteItem(null);
    } catch (err) {
      console.error(`Delete ${deleteType} error:`, err);
      setDeleteError(
        err.response?.data?.error ||
          `Failed to delete ${deleteType}. Please try again.`,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateUserRole = async (targetUser, newRole) => {
    try {
      setError("");
      setSuccess("");
      const id = targetUser.id || targetUser._id;
      const res = await updateUserRoleApi(id, newRole);
      setUsers(
        users.map((u) =>
          u.id === id || u._id === id ? { ...u, role: newRole } : u,
        ),
      );
      setSuccess(res.message || `User role updated to ${newRole}`);
      if (
        currentCrmUser &&
        (currentCrmUser.id === id || currentCrmUser._id === id)
      ) {
        setCurrentCrmUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError(err.response?.data?.error || "Failed to update user role");
    }
  };

  const triggerUserDelete = (targetUser) => {
    setDeleteItem(targetUser);
    setDeleteType("user");
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const openSendMessageModal = (
    target = "single",
    targetUser = null,
    targetSegment = "all",
  ) => {
    setCrmMessageTarget(target);
    setCrmMessageTargetUser(targetUser);
    setCrmMessageTargetSegment(targetSegment);
    setCrmMessageType("email");
    setCrmMessageSubject("");
    setCrmMessageBody("");
    setError("");
    setSuccess("");
    setCrmMessageModalOpen(true);
  };

  const handleSendMessageSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      let targetEmails = [];
      let targetFcmTokens = [];

      if (crmMessageTarget === "single") {
        if (crmMessageTargetUser) {
          targetEmails = [crmMessageTargetUser.email];
          if (crmMessageTargetUser.fcmToken) {
            targetFcmTokens = [crmMessageTargetUser.fcmToken];
          }
        }
      } else {
        // Segment broadcasting
        const segmentUsers = users.filter((u) => {
          if (crmMessageTargetSegment === "all") return true;

          // compute segment
          const userOrders = orders.filter(
            (o) => o.user?._id === u._id || o.user === u._id,
          );
          const totalSpent = userOrders.reduce(
            (sum, o) =>
              o.orderStatus !== "Cancelled" ? sum + o.totalPrice : sum,
            0,
          );
          const segment =
            totalSpent > 500 ? "vip" : totalSpent >= 10 ? "regular" : "new";

          return segment === crmMessageTargetSegment;
        });

        targetEmails = segmentUsers.map((u) => u.email).filter(Boolean);
        targetFcmTokens = segmentUsers.map((u) => u.fcmToken).filter(Boolean);
      }

      if (crmMessageType === "email" || crmMessageType === "both") {
        if (targetEmails.length === 0) {
          throw new Error("No recipient emails found for the selected target.");
        }
        if (!crmMessageSubject || !crmMessageBody) {
          throw new Error("Email subject and message body are required.");
        }
        await sendCrmEmailApi({
          emails: targetEmails,
          subject: crmMessageSubject,
          message: crmMessageBody,
        });
      }

      if (crmMessageType === "notification" || crmMessageType === "both") {
        if (targetFcmTokens.length === 0) {
          if (crmMessageType === "notification") {
            throw new Error(
              "No Firebase FCM push notification tokens found for the selected recipients.",
            );
          }
        } else {
          await sendCrmNotificationApi({
            fcmTokens: targetFcmTokens,
            title:
              crmMessageType === "both"
                ? crmMessageSubject
                : crmMessageSubject || "Update from ShopX",
            body: crmMessageBody,
          });
        }
      }

      setSuccess("Message dispatched successfully!");
      setTimeout(() => {
        setCrmMessageModalOpen(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error("CRM Send Message Error:", err);
      setError(
        err.message ||
          err.response?.data?.error ||
          "Failed to dispatch messages.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    if (!title || !price || !description || !category) {
      setError("All fields except Image URL are required.");
      setFormLoading(false);
      return;
    }

    const productData = {
      title,
      price: Number(price),
      description,
      category,
      image,
    };

    try {
      if (currentProduct) {
        const id = currentProduct.id || currentProduct._id;
        const updated = await updateProductApi(id, productData);
        setProducts(
          products.map((p) => (p.id === id || p._id === id ? updated : p)),
        );
        setSuccess("Product updated successfully!");
      } else {
        const created = await createProductApi(productData);
        setProducts([created, ...products]);
        setSuccess("Product created successfully!");
      }

      setTimeout(() => {
        setProductModalOpen(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error("Save product error:", err);
      setError(err.response?.data?.error || "Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  // Special Offer Modal Helpers
  const openCreateOfferModal = () => {
    setCurrentOffer(null);
    setOfferCode("");
    setOfferDiscount("");
    setOfferTitle("");
    setOfferDesc("");
    setOfferExpiry("");
    setOfferTag("");
    setOfferIcon("");
    setOfferColor("#e8622a");
    setOfferBg("#fff3ed");
    setError("");
    setSuccess("");
    setOfferModalOpen(true);
  };

  const openEditOfferModal = (offer) => {
    setCurrentOffer(offer);
    setOfferCode(offer.code);
    setOfferDiscount(offer.discount);
    setOfferTitle(offer.title);
    setOfferDesc(offer.desc);
    setOfferExpiry(offer.expiry);
    setOfferTag(offer.tag);
    setOfferIcon(offer.icon || "");
    setOfferColor(offer.color || "#e8622a");
    setOfferBg(offer.bg || "#fff3ed");
    setError("");
    setSuccess("");
    setOfferModalOpen(true);
  };

  const triggerOfferDelete = (offer) => {
    setDeleteItem(offer);
    setDeleteType("offer");
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    if (
      !offerCode ||
      !offerDiscount ||
      !offerTitle ||
      !offerDesc ||
      !offerExpiry ||
      !offerTag
    ) {
      setError(
        "Required fields (Code, Discount, Title, Description, Expiry, Tag) are missing.",
      );
      setFormLoading(false);
      return;
    }

    const offerData = {
      code: offerCode.toUpperCase(),
      discount: offerDiscount,
      title: offerTitle,
      desc: offerDesc,
      expiry: offerExpiry,
      tag: offerTag,
      icon: offerIcon,
      color: offerColor,
      bg: offerBg,
    };

    try {
      if (currentOffer) {
        const id = currentOffer.id || currentOffer._id;
        const updated = await updateSpecialOfferApi(id, offerData);
        setOffers(
          offers.map((o) =>
            o.id === id || o._id === id ? updated.specialOffer : o,
          ),
        );
        setSuccess("Special offer updated successfully!");
      } else {
        const created = await createSpecialOfferApi(offerData);
        setOffers([created.specialOffer, ...offers]);
        setSuccess("Special offer created successfully!");
      }

      setTimeout(() => {
        setOfferModalOpen(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error("Save offer error:", err);
      setError(err.response?.data?.error || "Failed to save special offer.");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isLoggedIn || !user || user.role !== "admin") {
    return null; // Don't render anything while redirecting
  }

  return (
    <div
      ref={adminPanelRef}
      className="flex h-screen bg-[#f5f3ef] text-[#2c2420] overflow-hidden"
    >
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#ede8e2] shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#ede8e2]">
          <Link
            to="/"
            className="flex items-center hover:opacity-85 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white shadow-md shadow-[#e8622a]/20">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <span className="ml-2.5 text-lg font-black tracking-tight">
              SHOP<span className="text-[#e8622a]">x</span> Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.to ||
              (item.to.includes("tab=") &&
                location.search.includes(item.to.split("?")[1])) ||
              (item.to === "/admin" && location.search === "");
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#e8622a]/8 text-[#e8622a]"
                    : "text-[#5a4e46] hover:text-[#2c2420] hover:bg-stone-100/60"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#ede8e2]">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#5a4e46] hover:text-[#2c2420] hover:bg-stone-100/60 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Back to Shop
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-[#2c2420]/45 backdrop-blur-sm">
          <div className="w-64 bg-white flex flex-col h-full animate-scale-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#ede8e2]">
              <Link
                to="/"
                className="flex items-center hover:opacity-85 transition-opacity"
              >
                <span className="text-lg font-black tracking-tight">
                  SHOP<span className="text-[#e8622a]">x</span> Admin
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#8c7e74] hover:text-[#2c2420]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active =
                  currentPath === item.to ||
                  (item.to.includes("tab=") &&
                    location.search.includes(item.to.split("?")[1])) ||
                  (item.to === "/admin" && location.search === "");
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-[#e8622a]/8 text-[#e8622a]"
                        : "text-[#5a4e46] hover:text-[#2c2420] hover:bg-[#faf9f7]"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#ede8e2]">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#5a4e46] hover:text-[#2c2420] transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
                Back to Shop
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#ede8e2] flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#5a4e46] hover:text-[#2c2420] p-1 rounded-lg hover:bg-stone-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Clickable Mobile Logo */}
            <Link
              to="/"
              className="md:hidden flex items-center gap-2 select-none group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white shadow-md shadow-[#e8622a]/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span
                  className="text-sm font-black tracking-tight"
                  style={{ color: "#2c2420" }}
                >
                  SHOP
                </span>
                <span
                  className="text-sm font-black tracking-tight"
                  style={{ color: "#e8622a" }}
                >
                  x
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-[#8c7e74] hover:text-[#2c2420] hover:bg-stone-100 transition-all">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#e8622a]" />
            </button>

            <div className="h-8 w-px bg-[#ede8e2]" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#e8622a] to-[#c44e1e] text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                AD
              </div>
              <span className="hidden sm:inline text-xs font-bold text-[#2c2420]">
                Admin Portal
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard body wrap */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div key={activeTab} className="admin-tab-content-anim">
            {/* Header Dashboard Info */}
            {activeTab !== "dashboard" && (
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 mb-2">
                    Admin Controller
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-[#2c2420]">
                    {activeTab === "products"
                      ? "Products Inventory"
                      : activeTab === "offers"
                        ? "Special Offers & Coupons"
                        : activeTab === "orders"
                          ? "Orders Tracking"
                          : "Customer Directory & CRM"}
                  </h2>
                  <p className="text-xs text-[#8c7e74] mt-1 font-medium">
                    {activeTab === "products"
                      ? "Manage your inventory catalog, update prices, and stock details."
                      : activeTab === "offers"
                        ? "Configure promo discount codes, custom tags, and coupon expiry."
                        : activeTab === "orders"
                          ? "Monitor client orders, process delivery updates, and update statuses."
                          : "Manage customer profiles, view user roles, lifetime values, and send marketing broadcasts."}
                  </p>
                </div>

                {activeTab === "products" && (
                  <button
                    onClick={openCreateProductModal}
                    className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create New Product
                  </button>
                )}
                {activeTab === "offers" && (
                  <button
                    onClick={openCreateOfferModal}
                    className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#e8622a] text-white hover:bg-[#d94e14] px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Special Offer
                  </button>
                )}
                {activeTab === "crm" && (
                  <button
                    onClick={() => openSendMessageModal("segment", null, "all")}
                    className="btn-glow inline-flex items-center gap-2 rounded-xl bg-[#e8622a] text-white hover:bg-[#d94e14] px-5 py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    Broadcast Message
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === "dashboard" && <Dashboard />}

            {/* TAB CONTENT: PRODUCTS */}
            {activeTab === "products" && (
              <>
                {productsLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]"
                      />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                    <p className="text-sm font-semibold text-[#5a4e46]">
                      No products found
                    </p>
                    <button
                      onClick={fetchProducts}
                      className="text-xs text-[#e8622a] font-bold hover:underline mt-2"
                    >
                      Reload Database
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                            <th className="p-4 w-20">Image</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-center w-36">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f3ef]">
                          {products.map((product) => (
                            <tr
                              key={product.id || product._id}
                              className="hover:bg-stone-50/50 transition-colors group"
                            >
                              <td className="p-4">
                                <div className="h-12 w-12 rounded-lg bg-stone-50 border border-[#ede8e2] flex items-center justify-center p-1.5 overflow-hidden">
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              </td>
                              <td className="p-4 max-w-xs md:max-w-md">
                                <p
                                  className="text-sm font-bold text-[#2c2420] truncate"
                                  title={product.title}
                                >
                                  {product.title}
                                </p>
                                <p className="text-[10px] text-[#8c7e74] truncate max-w-sm font-medium">
                                  {product.description}
                                </p>
                              </td>
                              <td className="p-4 capitalize">
                                <span className="inline-flex rounded-full bg-stone-100 border border-stone-200/40 px-2.5 py-0.5 text-[10px] font-bold text-stone-600">
                                  {product.category}
                                </span>
                              </td>
                              <td className="p-4 text-right font-extrabold text-[#2c7a4a] text-sm">
                                ${product.price?.toFixed(2)}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      openEditProductModal(product)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/20 transition-all cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      triggerProductDelete(product)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/20 transition-all cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: OFFERS */}
            {activeTab === "offers" && (
              <>
                {offersLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]"
                      />
                    ))}
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                    <p className="text-sm font-semibold text-[#5a4e46]">
                      No special offers or coupons found
                    </p>
                    <button
                      onClick={fetchOffers}
                      className="text-xs text-[#e8622a] font-bold hover:underline mt-2"
                    >
                      Reload Offers
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                            <th className="p-4 w-32">Tag</th>
                            <th className="p-4">Coupon Code</th>
                            <th className="p-4">Discount</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Expiry</th>
                            <th className="p-4 text-center">Style</th>
                            <th className="p-4 text-center w-36">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f3ef]">
                          {offers.map((offer) => (
                            <tr
                              key={offer.id || offer._id}
                              className="hover:bg-stone-50/50 transition-colors group"
                            >
                              <td className="p-4">
                                <span
                                  className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                                  style={{
                                    color: offer.color,
                                    background: offer.bg,
                                  }}
                                >
                                  {offer.tag}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-extrabold text-sm text-[#2c2420]">
                                {offer.code}
                              </td>
                              <td className="p-4 text-sm font-black text-[#e8622a]">
                                {offer.discount}
                              </td>
                              <td className="p-4">
                                <p className="text-sm font-bold text-[#2c2420] truncate max-w-xs">
                                  {offer.title}
                                </p>
                                <p className="text-[10px] text-[#8c7e74] truncate max-w-xs font-medium">
                                  {offer.desc}
                                </p>
                              </td>
                              <td className="p-4 text-xs font-bold text-[#8c7e74]">
                                {offer.expiry}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className="w-4 h-4 rounded-full border border-stone-200/50 inline-block"
                                    style={{ backgroundColor: offer.color }}
                                    title={`Text: ${offer.color}`}
                                  />
                                  <span
                                    className="w-4 h-4 rounded-full border border-stone-200/50 inline-block"
                                    style={{ backgroundColor: offer.bg }}
                                    title={`Bg: ${offer.bg}`}
                                  />
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditOfferModal(offer)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/20 transition-all cursor-pointer"
                                    title="Edit Special Offer"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => triggerOfferDelete(offer)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ede8e2] text-[#8c7e74] hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/20 transition-all cursor-pointer"
                                    title="Delete Special Offer"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: ORDERS */}
            {activeTab === "orders" && (
              <>
                {ordersLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]"
                      />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                    <p className="text-sm font-semibold text-[#5a4e46]">
                      No orders found
                    </p>
                    <button
                      onClick={fetchOrders}
                      className="text-xs text-[#e8622a] font-bold hover:underline mt-2"
                    >
                      Reload Orders
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm animate-fade-in">
                    {success && (
                      <div className="p-4 bg-emerald-50 text-emerald-700 border-b border-emerald-100 text-xs font-bold transition-all duration-300">
                        ✓ {success}
                      </div>
                    )}
                    {error && (
                      <div className="p-4 bg-rose-50 text-rose-600 border-b border-rose-100 text-xs font-bold transition-all duration-300">
                        ✗ {error}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Items Ordered</th>
                            <th className="p-4">Order Date</th>
                            <th className="p-4 text-right">Total Price</th>
                            <th className="p-4 text-center w-48">
                              Status Update
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f3ef]">
                          {orders.map((order) => (
                            <tr
                              key={order._id}
                              className="hover:bg-stone-50/50 transition-colors group"
                            >
                              <td className="p-4 font-mono font-extrabold text-xs text-[#2c2420]">
                                {order.orderNumber}
                              </td>
                              <td className="p-4">
                                <p className="text-xs font-bold text-[#2c2420]">
                                  {order.user?.name || "Guest"}
                                </p>
                                <p className="text-[10px] text-[#8c7e74] font-medium">
                                  {order.user?.email || "N/A"}
                                </p>
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="text-xs text-[#5a4e46] font-medium space-y-0.5">
                                  {order.orderItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="truncate"
                                      title={`${item.title} (x${item.quantity})`}
                                    >
                                      • {item.title}{" "}
                                      <span className="text-[#8c7e74] font-bold">
                                        (x{item.quantity})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 text-xs font-semibold text-[#8c7e74]">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </td>
                              <td className="p-4 text-right font-black text-[#e8622a] text-xs">
                                ${order.totalPrice?.toFixed(2)}
                              </td>
                              <td className="p-4 text-center">
                                <select
                                  value={order.orderStatus}
                                  disabled={
                                    order.orderStatus === "Cancelled" ||
                                    order.orderStatus === "Delivered"
                                  }
                                  title={
                                    order.orderStatus === "Cancelled" ||
                                    order.orderStatus === "Delivered"
                                      ? "Locked (Cancelled/Delivered orders cannot be modified)"
                                      : "Update Order Status"
                                  }
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      setError("");
                                      setSuccess("");
                                      await updateOrderStatus(
                                        order._id,
                                        newStatus,
                                      );
                                      setOrders(
                                        orders.map((o) =>
                                          o._id === order._id
                                            ? { ...o, orderStatus: newStatus }
                                            : o,
                                        ),
                                      );
                                      setSuccess(
                                        `Order ${order.orderNumber} status updated to ${newStatus}`,
                                      );
                                    } catch (err) {
                                      console.error(
                                        "Failed to update status:",
                                        err,
                                      );
                                      setError(
                                        err.response?.data?.error ||
                                          "Failed to update order status",
                                      );
                                    }
                                  }}
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e8622a]/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                                    order.orderStatus === "Pending"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : order.orderStatus === "Placed"
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                        : order.orderStatus === "Processing"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : order.orderStatus === "Shipped"
                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                            : order.orderStatus === "Cancelled"
                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Placed">Placed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: CRM */}
            {activeTab === "crm" && (
              <>
                {usersLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl h-16 animate-pulse border border-[#ede8e2]"
                      />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
                    <p className="text-sm font-semibold text-[#5a4e46]">
                      No users found
                    </p>
                    <button
                      onClick={fetchUsers}
                      className="text-xs text-[#e8622a] font-bold hover:underline mt-2"
                    >
                      Reload Customers List
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* CRM toolbar and segment filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#ede8e2] shadow-sm">
                      {/* Segmentation filters */}
                      <div className="flex flex-wrap gap-1 bg-stone-50 border border-[#ede8e2] p-1 rounded-xl w-fit">
                        {[
                          { label: "All Customers", val: "all" },
                          { label: "VIPs (Spent >$500)", val: "vip" },
                          { label: "Regulars ($10-$500)", val: "regular" },
                          { label: "New Users ($0)", val: "new" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => setCrmSegmentTab(opt.val)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                              crmSegmentTab === opt.val
                                ? "bg-white text-[#e8622a] border border-[#ede8e2] shadow-sm"
                                : "text-[#6b5e54] hover:text-[#2c2420]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Search Input */}
                      <div className="relative max-w-md w-full md:w-72">
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={crmSearch}
                          onChange={(e) => setCrmSearch(e.target.value)}
                          className="w-full rounded-xl border border-[#ede8e2] bg-stone-50/50 pl-9 pr-4 py-2 text-xs text-[#2c2420] outline-none focus:border-[#e8622a] focus:bg-white transition-all font-semibold"
                        />
                        <svg
                          className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#8c7e74]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Directory table */}
                    <div className="overflow-hidden rounded-2xl border border-[#ede8e2] bg-white shadow-sm animate-fade-in">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#f5f3ef] text-[10px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                              <th className="p-4">Customer</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Registration</th>
                              <th className="p-4 text-right">Orders</th>
                              <th className="p-4 text-right">Lifetime Value</th>
                              <th className="p-4 text-center">Segment</th>
                              <th className="p-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f5f3ef]">
                            {(() => {
                              const filteredUsers = users.filter((u) => {
                                const query = crmSearch.toLowerCase();
                                const matchSearch =
                                  u.name?.toLowerCase().includes(query) ||
                                  u.email?.toLowerCase().includes(query);
                                if (!matchSearch) return false;

                                if (crmSegmentTab === "all") return true;

                                const userOrders = orders.filter(
                                  (o) =>
                                    o.user?._id === u._id || o.user === u._id,
                                );
                                const totalSpent = userOrders.reduce(
                                  (sum, o) =>
                                    o.orderStatus !== "Cancelled"
                                      ? sum + o.totalPrice
                                      : sum,
                                  0,
                                );
                                const segment =
                                  totalSpent > 500
                                    ? "vip"
                                    : totalSpent >= 10
                                      ? "regular"
                                      : "new";

                                return segment === crmSegmentTab;
                              });

                              if (filteredUsers.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan="7"
                                      className="p-8 text-center text-xs text-[#8c7e74] italic"
                                    >
                                      No customers matched your filter query.
                                    </td>
                                  </tr>
                                );
                              }

                              return filteredUsers.map((u) => {
                                const userOrders = orders.filter(
                                  (o) =>
                                    o.user?._id === u._id || o.user === u._id,
                                );
                                const totalSpent = userOrders.reduce(
                                  (sum, o) =>
                                    o.orderStatus !== "Cancelled"
                                      ? sum + o.totalPrice
                                      : sum,
                                  0,
                                );
                                const orderCount = userOrders.length;
                                const segment =
                                  totalSpent > 500
                                    ? "VIP"
                                    : totalSpent >= 10
                                      ? "Regular"
                                      : "New";

                                return (
                                  <tr
                                    key={u._id}
                                    className="hover:bg-stone-50/50 transition-colors group"
                                  >
                                    <td className="p-4 flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full overflow-hidden bg-[#e8622a]/10 border border-[#ede8e2] shrink-0">
                                        <img
                                          src={
                                            u.avatar ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e8622a&color=fff&bold=true`
                                          }
                                          alt={u.name}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e8622a&color=fff&bold=true`;
                                          }}
                                        />
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-[#2c2420] truncate">
                                          {u.name}
                                        </p>
                                        <p className="text-[10px] text-[#8c7e74] font-medium truncate">
                                          {u.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                          u.role === "admin"
                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                            : "bg-gray-50 text-[#5a4e46] border-gray-200"
                                        }`}
                                      >
                                        {u.role}
                                      </span>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-[#8c7e74]">
                                      {new Date(
                                        u.createdAt || Date.now(),
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </td>
                                    <td className="p-4 text-right text-xs font-black text-[#2c2420]">
                                      {orderCount}
                                    </td>
                                    <td className="p-4 text-right text-xs font-black text-[#2c7a4a]">
                                      ${totalSpent.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                      <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                          segment === "VIP"
                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                            : segment === "Regular"
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : "bg-stone-50 text-stone-600 border-stone-200"
                                        }`}
                                      >
                                        {segment}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => {
                                            setCurrentCrmUser(u);
                                            setCrmModalOpen(true);
                                          }}
                                          className="rounded-lg px-2.5 py-1 text-xs font-bold bg-[#2c2420]/5 text-[#2c2420] hover:bg-[#2c2420]/10 cursor-pointer transition-all active:scale-95"
                                          title="View Profile Details"
                                        >
                                          Profile
                                        </button>
                                        <button
                                          onClick={() =>
                                            openSendMessageModal("single", u)
                                          }
                                          className="rounded-lg p-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all active:scale-95 flex items-center justify-center h-7 w-7"
                                          title="Send Message"
                                        >
                                          <Send className="h-3 w-3" />
                                        </button>
                                        {u._id !== user._id && (
                                          <button
                                            onClick={() => triggerUserDelete(u)}
                                            className="rounded-lg p-1 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-all active:scale-95 flex items-center justify-center h-7 w-7"
                                            title="Delete User Account"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal: Create/Edit Product */}
            {productModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => !formLoading && setProductModalOpen(false)}
                />

                <div className="glass relative w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in">
                  <button
                    onClick={() => setProductModalOpen(false)}
                    disabled={formLoading}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  <h3 className="text-lg font-black text-[#2c2420] mb-2">
                    {currentProduct
                      ? "Modify Product Details"
                      : "Stock New Catalog Product"}
                  </h3>
                  <p className="text-xs text-[#8c7e74] mb-5 font-medium leading-relaxed">
                    Fill in information below. This is synced across all
                    customer accounts.
                  </p>

                  {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Product Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Wireless Headset"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Retail Price (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 59.99"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a] cursor-pointer"
                        >
                          <option value="electronics">Electronics</option>
                          <option value="men's clothing">Men's Clothing</option>
                          <option value="women's clothing">
                            Women's Clothing
                          </option>
                          <option value="jewelery">Jewelery</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief specifications, details, sizing, material description..."
                        disabled={formLoading}
                        rows="3"
                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                        required
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setProductModalOpen(false)}
                        disabled={formLoading}
                        className="rounded-xl border px-5 py-2.5 text-xs font-bold transition-all border-[#d4c9be] text-[#5a4e46] hover:bg-[#faf9f7] cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {formLoading && (
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        {currentProduct ? "Save Changes" : "Publish Product"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: CREATE/EDIT SPECIAL OFFER */}
            {offerModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => !formLoading && setOfferModalOpen(false)}
                />

                <div className="glass relative w-full max-w-md rounded-2xl p-5 md:p-6 shadow-2xl animate-scale-in max-h-[95vh] overflow-y-auto">
                  <button
                    onClick={() => setOfferModalOpen(false)}
                    disabled={formLoading}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  <h3 className="text-lg font-black text-[#2c2420] mb-1">
                    {currentOffer
                      ? "Modify Special Offer"
                      : "Create New Special Offer"}
                  </h3>
                  <p className="text-[11px] text-[#8c7e74] mb-3 font-medium leading-relaxed">
                    Configure promotional discount code and tags. Dynamic offers
                    render immediately on client page.
                  </p>

                  {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleOfferSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          value={offerCode}
                          onChange={(e) => setOfferCode(e.target.value)}
                          placeholder="e.g. SUMMER50"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a] font-mono font-bold uppercase"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Discount Value
                        </label>
                        <input
                          type="text"
                          value={offerDiscount}
                          onChange={(e) => setOfferDiscount(e.target.value)}
                          placeholder="e.g. 50% OFF, FREE SHIPPING"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Offer Title
                        </label>
                        <input
                          type="text"
                          value={offerTitle}
                          onChange={(e) => setOfferTitle(e.target.value)}
                          placeholder="e.g. Mid-Summer Mega Event"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Offer Tag
                        </label>
                        <input
                          type="text"
                          value={offerTag}
                          onChange={(e) => setOfferTag(e.target.value)}
                          placeholder="e.g. FLASH SALE, CARD DEAL"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Expiry Description
                        </label>
                        <input
                          type="text"
                          value={offerExpiry}
                          onChange={(e) => setOfferExpiry(e.target.value)}
                          placeholder="e.g. Expires Aug 30, 2026"
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Text/Accent Color
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={offerColor}
                            onChange={(e) => setOfferColor(e.target.value)}
                            className="w-8 h-8 border rounded-lg cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={offerColor}
                            onChange={(e) => setOfferColor(e.target.value)}
                            placeholder="#e8622a"
                            disabled={formLoading}
                            className="rounded-xl border border-[#e4dfd9] px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:border-[#e8622a]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Background Color
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={offerBg}
                            onChange={(e) => setOfferBg(e.target.value)}
                            className="w-8 h-8 border rounded-lg cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={offerBg}
                            onChange={(e) => setOfferBg(e.target.value)}
                            placeholder="#fff3ed"
                            disabled={formLoading}
                            className="rounded-xl border border-[#e4dfd9] px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:border-[#e8622a]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                        Description
                      </label>
                      <textarea
                        value={offerDesc}
                        onChange={(e) => setOfferDesc(e.target.value)}
                        placeholder="Valid on electronics category. Minimum order $100."
                        disabled={formLoading}
                        rows="1.5"
                        className="rounded-xl border border-[#e4dfd9] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e8622a]"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[#8c7e74]">
                        SVG Icon Markup (optional)
                      </label>
                      <textarea
                        value={offerIcon}
                        onChange={(e) => setOfferIcon(e.target.value)}
                        placeholder='e.g. <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path ... /></svg>'
                        disabled={formLoading}
                        rows="1"
                        className="rounded-xl border border-[#e4dfd9] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#e8622a] font-mono"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setOfferModalOpen(false)}
                        disabled={formLoading}
                        className="rounded-xl border px-5 py-2.5 text-xs font-bold transition-all border-[#d4c9be] text-[#5a4e46] hover:bg-[#faf9f7] cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {formLoading && (
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        {currentOffer ? "Save Changes" : "Publish Offer"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Confirm Deletion */}
            {deleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => !deleteLoading && setDeleteModalOpen(false)}
                />

                <div className="glass relative w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in text-center">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleteLoading}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  {/* Danger Icon */}
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                    <svg
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-black text-[#2c2420] mb-2">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-[#8c7e74] mb-5 font-medium leading-relaxed">
                    Are you sure you want to permanently delete this{" "}
                    {deleteType}? This action cannot be undone.
                  </p>

                  {/* Preview Section */}
                  {deleteItem && (
                    <div className="mb-6 rounded-xl border border-[#ede8e2] bg-[#fafafa]/50 p-4 text-left flex items-center gap-3">
                      {deleteType === "product" ? (
                        <>
                          <div className="h-12 w-12 shrink-0 rounded-lg bg-white border border-[#ede8e2] flex items-center justify-center p-1 overflow-hidden">
                            <img
                              src={deleteItem.image}
                              alt={deleteItem.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#2c2420] truncate">
                              {deleteItem.title}
                            </p>
                            <p className="text-[10px] text-[#2c7a4a] font-extrabold mt-0.5">
                              ${deleteItem.price?.toFixed(2)}
                            </p>
                          </div>
                        </>
                      ) : deleteType === "offer" ? (
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                              style={{
                                color: deleteItem.color,
                                background: deleteItem.bg,
                              }}
                            >
                              {deleteItem.tag}
                            </span>
                            <span className="text-xs font-black text-[#e8622a]">
                              {deleteItem.discount}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#2c2420] mt-1.5 truncate">
                            {deleteItem.title}
                          </p>
                          <p className="text-[10px] text-[#8c7e74] font-medium mt-0.5 truncate">
                            Code:{" "}
                            <span className="font-mono font-bold text-[#2c2420]">
                              {deleteItem.code}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="w-full text-left flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center font-bold text-rose-700 uppercase shrink-0">
                            {deleteItem.avatar ? (
                              <img
                                src={deleteItem.avatar}
                                alt={deleteItem.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              deleteItem.name?.substring(0, 2)
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#2c2420] truncate">
                              {deleteItem.name}
                            </p>
                            <p className="text-[10px] text-[#8c7e74] font-medium truncate">
                              {deleteItem.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {deleteError && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake text-left">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={deleteLoading}
                      className="w-full rounded-xl bg-rose-600 text-white hover:bg-rose-700 px-6 py-2.5 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {deleteLoading && (
                        <svg
                          className="animate-spin h-3.5 w-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {deleteLoading ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Customer Profile Details */}
            {crmModalOpen &&
              currentCrmUser &&
              (() => {
                const userOrders = orders.filter(
                  (o) =>
                    o.user?._id === currentCrmUser._id ||
                    o.user === currentCrmUser._id,
                );
                const totalSpent = userOrders.reduce(
                  (sum, o) =>
                    o.orderStatus !== "Cancelled" ? sum + o.totalPrice : sum,
                  0,
                );
                const orderCount = userOrders.length;
                const segment =
                  totalSpent > 500
                    ? "VIP Customer"
                    : totalSpent >= 10
                      ? "Regular Customer"
                      : "New Customer";

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setCrmModalOpen(false)}
                    />

                    <div
                      className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 border border-white/70 shadow-2xl"
                      style={{
                        background:
                          "linear-gradient(150deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 251, 249, 0.98) 100%)",
                      }}
                    >
                      <button
                        onClick={() => setCrmModalOpen(false)}
                        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer z-10"
                      >
                        ✕
                      </button>

                      {/* Profile header */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#ede8e2] pb-6 mb-6">
                        <div className="h-16 w-16 rounded-full overflow-hidden border border-[#ede8e2] bg-[#e8622a]/10 shrink-0">
                          <img
                            src={
                              currentCrmUser.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentCrmUser.name)}&background=e8622a&color=fff&bold=true`
                            }
                            alt={currentCrmUser.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-center sm:text-left flex-1 min-w-0">
                          <h3 className="text-lg font-black text-[#2c2420] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            {currentCrmUser.name}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                segment === "VIP Customer"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : segment === "Regular Customer"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-stone-50 text-stone-600 border border-stone-200"
                              }`}
                            >
                              {segment}
                            </span>
                          </h3>
                          <p className="text-xs text-[#8c7e74] font-medium truncate mt-0.5">
                            {currentCrmUser.email}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold mt-1">
                            Joined:{" "}
                            {new Date(
                              currentCrmUser.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setCrmModalOpen(false);
                              openSendMessageModal("single", currentCrmUser);
                            }}
                            className="rounded-xl px-4 py-2 text-xs font-bold bg-[#e8622a] text-white hover:bg-[#d94e14] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Send Message
                          </button>
                          {currentCrmUser.role === "admin" ? (
                            <button
                              onClick={() =>
                                handleUpdateUserRole(currentCrmUser, "user")
                              }
                              className="rounded-xl px-4 py-2 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer active:scale-95 animate-scale-in"
                            >
                              Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleUpdateUserRole(currentCrmUser, "admin")
                              }
                              className="rounded-xl px-4 py-2 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1 animate-scale-in"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </div>
                      </div>

                      {/* KPI totals summary cards */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-stone-50 border border-[#ede8e2]/60 rounded-xl p-3 text-center shadow-inner">
                          <span className="text-[8px] font-black uppercase text-[#8c7e74] tracking-wider block">
                            Total Spent
                          </span>
                          <span className="text-sm font-black text-[#2c7a4a] block mt-1">
                            ${totalSpent.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-stone-50 border border-[#ede8e2]/60 rounded-xl p-3 text-center shadow-inner">
                          <span className="text-[8px] font-black uppercase text-[#8c7e74] tracking-wider block">
                            Orders Count
                          </span>
                          <span className="text-sm font-black text-[#2c2420] block mt-1">
                            {orderCount}
                          </span>
                        </div>
                        <div className="bg-stone-50 border border-[#ede8e2]/60 rounded-xl p-3 text-center shadow-inner">
                          <span className="text-[8px] font-black uppercase text-[#8c7e74] tracking-wider block">
                            Avg Order Value
                          </span>
                          <span className="text-sm font-black text-[#e8622a] block mt-1">
                            $
                            {orderCount > 0
                              ? (totalSpent / orderCount).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Order history */}
                      <div className="text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#2c2420] mb-3 flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-[#e8622a]" />
                          Customer Order History ({orderCount})
                        </h4>

                        {userOrders.length === 0 ? (
                          <p className="text-xs text-[#8c7e74] italic py-6 text-center bg-stone-50/50 rounded-xl border border-dashed border-[#ede8e2]">
                            No purchases made yet by this customer.
                          </p>
                        ) : (
                          <div className="border border-[#ede8e2] rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-[#f5f3ef] text-[9px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                                  <th className="p-3">Order ID</th>
                                  <th className="p-3">Date</th>
                                  <th className="p-3 text-right">Items</th>
                                  <th className="p-3 text-right">
                                    Total Price
                                  </th>
                                  <th className="p-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#f5f3ef] font-semibold text-[#5a4e46]">
                                {userOrders.map((ord) => (
                                  <tr
                                    key={ord._id}
                                    className="hover:bg-stone-50/20"
                                  >
                                    <td className="p-3 font-mono font-bold text-[#2c2420]">
                                      {ord.orderNumber}
                                    </td>
                                    <td className="p-3 text-[#8c7e74] font-medium">
                                      {new Date(
                                        ord.createdAt,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-right">
                                      {ord.orderItems.reduce(
                                        (acc, it) => acc + it.quantity,
                                        0,
                                      )}
                                    </td>
                                    <td className="p-3 text-right font-black text-[#2c2420]">
                                      ${ord.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="p-3 text-center">
                                      <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-black border uppercase tracking-wider ${
                                          ord.orderStatus === "Delivered"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : ord.orderStatus === "Cancelled"
                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                              : "bg-orange-50 text-orange-700 border-orange-200"
                                        }`}
                                      >
                                        {ord.orderStatus}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Modal: Send CRM Broadcast / Message */}
            {crmMessageModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45 animate-fade-in">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => !formLoading && setCrmMessageModalOpen(false)}
                />

                <div className="glass relative w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl animate-scale-in text-left">
                  <button
                    onClick={() => setCrmMessageModalOpen(false)}
                    disabled={formLoading}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:rotate-90 hover:text-[#2c2420] transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  <h3 className="text-lg font-black text-[#2c2420] mb-1 flex items-center gap-1.5">
                    <Mail className="h-5 w-5 text-[#e8622a]" />
                    {crmMessageTarget === "single"
                      ? "Message Customer"
                      : "Broadcast Marketing Campaign"}
                  </h3>
                  <p className="text-xs text-[#8c7e74] mb-5 font-medium">
                    {crmMessageTarget === "single"
                      ? `Composing direct email or push message to: ${crmMessageTargetUser?.name || "Customer"}`
                      : `Composing message broadcast for segment: ${crmMessageTargetSegment.toUpperCase()}`}
                  </p>

                  {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                      {success}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendMessageSubmit}
                    className="space-y-4"
                  >
                    {/* Channel Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                        Message Channel
                      </label>
                      <div className="flex gap-4">
                        {[
                          { label: "Email (SMTP)", val: "email" },
                          {
                            label: "Push Notification (FCM)",
                            val: "notification",
                          },
                          { label: "Both Channels", val: "both" },
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className="flex items-center gap-2 text-xs font-bold text-[#5a4e46] cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="crmMsgType"
                              value={opt.val}
                              checked={crmMessageType === opt.val}
                              onChange={(e) =>
                                setCrmMessageType(e.target.value)
                              }
                              disabled={formLoading}
                              className="text-[#e8622a] focus:ring-[#e8622a] border-[#ede8e2]"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Segment Target Selection (only if broadcasting) */}
                    {crmMessageTarget === "segment" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                          Recipient Customer Segment
                        </label>
                        <select
                          value={crmMessageTargetSegment}
                          onChange={(e) =>
                            setCrmMessageTargetSegment(e.target.value)
                          }
                          disabled={formLoading}
                          className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-[#e8622a] font-bold cursor-pointer"
                        >
                          <option value="all">
                            All Registered Customers ({users.length})
                          </option>
                          <option value="vip">
                            VIP Customers (Spent &gt;$500)
                          </option>
                          <option value="regular">
                            Regular Customers ($10-$500)
                          </option>
                          <option value="new">New Customers ($0 Spend)</option>
                        </select>
                      </div>
                    )}

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                        {crmMessageType === "notification"
                          ? "Push Notification Title"
                          : "Email Subject"}
                      </label>
                      <input
                        type="text"
                        value={crmMessageSubject}
                        onChange={(e) => setCrmMessageSubject(e.target.value)}
                        placeholder={
                          crmMessageType === "notification"
                            ? "e.g. Flash Deal Live! ⚡"
                            : "e.g. Special Discount Coupon for you!"
                        }
                        disabled={formLoading}
                        className="rounded-xl border border-[#e4dfd9] px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-[#e8622a] font-bold"
                        required
                      />
                    </div>

                    {/* Message Body */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">
                        Message Content / Body
                      </label>
                      <textarea
                        value={crmMessageBody}
                        onChange={(e) => setCrmMessageBody(e.target.value)}
                        placeholder="Write your email body or notification message text here..."
                        rows="5"
                        disabled={formLoading}
                        className="w-full rounded-xl border border-[#e4dfd9] px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#e8622a] font-semibold leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rounded-xl bg-[#2c2420] text-white hover:bg-[#3d3028] px-6 py-3 text-xs font-bold transition-all shadow hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 w-fit"
                    >
                      {formLoading && (
                        <svg
                          className="animate-spin h-3.5 w-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      Dispatch Message
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
