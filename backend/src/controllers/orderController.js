import Order from "../models/orderModel.js";
import { emailQueue } from "../queues/emailQueue.js";
import Cart from "../models/cartModel.js";
import { getIO } from "../config/socket.js";
import { sendNotification } from "../utils/sendNotification.js";
import User from "../models/userModel.js";

//Create new order

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentInfo,
      totalPrice,
      shippingPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items provided" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.zip
    ) {
      return res
        .status(400)
        .json({ error: "Complete shipping address is required" });
    }

    // Generate unique order number
    const orderNumber = `SHOPX-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        status: paymentInfo?.status || "Pending",
        cardLastFour: paymentInfo?.cardLastFour || "••••",
        paymentMethod: paymentInfo?.paymentMethod || "Card",
        paymentMode: paymentInfo?.paymentMode || "Online",
      },
      totalPrice: Number(totalPrice),
      shippingPrice: Number(shippingPrice || 0.0),
      orderNumber,
      orderStatus: "Pending",
    });

    // Clear DB cart
    try {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
      console.log(`Database cart cleared for user: ${req.user.email}`);
    } catch (cartClearErr) {
      console.error("Failed to clear database cart on checkout:", cartClearErr);
    }

    // Socket emit
    try {
      const io = getIO();
      io.to(req.user._id.toString()).emit("newOrder", {
        message: `Your order ${orderNumber} has been placed successfully!`,
      });
      console.log("New order event emitted to user", req.user._id);
    } catch (error) {
      console.error("Failed to emit new order event:", error);
    }
    console.log("req.user =", req.user);
    console.log("FCM Token =", req.user?.fcmToken);
    // Push notification
    try {
      if (req.user?.fcmToken) {
        console.log("Create Order Token:", req.user.fcmToken);
        await sendNotification(
          req.user.fcmToken,
          "Order Status",
          "Your Order Under Processing",
        );
        console.log("Notification sent successfully");
      } else {
        console.log("FCM token missing for user, skipping push notification");
      }
    } catch (error) {
      console.error("Failed to send order push notification:", error);
    }

    // Email queue (single correct enqueue)
    try {
      await emailQueue.add("sendEmail", {
        type: "ORDER_NOTIFICATION",
        data: {
          email: req.user.email,
          name: req.user.name,
          fcmToken: req.user.fcmToken,
          orderId: order._id,
        },
      });
      console.log(`Order confirmation email queued for ${req.user.email}`);
    } catch (emailError) {
      console.error("Failed to queue order email:", emailError);
    }
    

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to place order" });
  }
};

//Get logged in user orders

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "category")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Access check: only user who placed it or an admin can access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

//Get all orders (Admin only)

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("orderItems.product", "category")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
};

//Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required" });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (
      order.orderStatus === "Cancelled" ||
      order.orderStatus === "Delivered"
    ) {
      return res.status(400).json({
        error: `Cannot change status. Order is already ${order.orderStatus}.`,
      });
    }

    order.orderStatus = status;
    await order.save();

    // Fetch fresh user with fcmToken directly from DB (not from populate)
    const orderUser = await User.findById(order.user._id).select("name email fcmToken");
    const userFcmToken = orderUser?.fcmToken;

    console.log("=== ORDER UPDATE DEBUG ===");
    console.log("Status:", status);
    console.log("User:", orderUser?.email);
    console.log("FCM Token:", userFcmToken ? "EXISTS" : "MISSING");
    console.log("==========================");

    // Emit live order status update via Socket.io
    try {
      const io = getIO();
      io.to(order.user._id.toString()).emit("orderStatusUpdate", {
        orderId: order._id,
        status: status,
        message: `Your order status has been updated to: ${status}`,
      });
      console.log(
        "Order status update event emitted via socket to user:",
        order.user._id,
      );
    } catch (socketErr) {
      console.error("Failed to emit status update socket event:", socketErr);
    }

    // Send FCM push notification for ALL status updates
    const statusMessages = {
      Processing: "Your Order is Under Processing",
      Placed: "Your Order Has Been Placed",
      Shipped: "Your Order Has Been Shipped",
      Delivered: "Your Order Has Been Delivered",
      Cancelled: "Your Order Has Been Cancelled",
    };

    try {
      if (userFcmToken) {
        await sendNotification(
          userFcmToken,
          "Order Status Update",
          statusMessages[status] || `Your order status: ${status}`,
        );
        console.log(`${status} FCM notification sent successfully`);
      } else {
        console.log("No FCM token found for user, skipping push notification");
      }
    } catch (notifError) {
      console.error("FCM notification error:", notifError.message);
    }

    // Queue status-specific email
    try {
      const emailData = {
        email: order.user.email,
        customerName: order.user.name,
        orderNumber: order.orderNumber,
        totalAmount: order.totalPrice,
        address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}`,
        products: order.orderItems,
      };

      const emailTypeMap = {
        Processing: "PROCESSING_ORDER",
        Placed: "PLACED_ORDER",
        Shipped: "SHIPPED_ORDER",
        Delivered: "DELIVERED_EMAIL",
        Cancelled: "CANCEL_ORDER",
      };

      const emailType = emailTypeMap[status];
      if (emailType) {
        // For cancel, use slightly different data keys
        const emailPayload = status === "Cancelled" 
          ? { email: order.user.email, name: order.user.name, orderId: order.orderNumber, totalAmount: order.totalPrice }
          : emailData;

        await emailQueue.add("sendEmail", {
          type: emailType,
          data: emailPayload,
        });
        console.log(`${status} email queued`);
      }
    } catch (emailError) {
      console.error("Email queue error:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

//Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email fcmToken",
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You cannot cancel this order" });
    }
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return res.status(400).json({
        error:
          "you cannot cancel this order as its already shipped or delivered",
      });
    }
    order.orderStatus = "Cancelled";
    await order.save();
    try {
      await sendNotification(
        order.user.fcmToken,
        "Order Status",
        "Your Order Has Been Cancelled",
      );
      console.log("Cancelled notification sent successfully");
    } catch (error) {
      console.log("error");
    }
    await emailQueue.add("email", {
      type: "CANCEL_ORDER",
      data: {
        email: order.user.email,
        name: order.user.name,
        orderId: order.orderNumber,
        totalAmount: order.totalPrice,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

//Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Order ID is required" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (
      ["Pending", "Placed", "Processing", "Shipped"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        error:
          "Cannot delete order that is pending, placed, processing, or shipped",
      });
    }
    await Order.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};
