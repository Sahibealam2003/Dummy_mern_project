import Order from "../models/orderModel.js";
import { addEmailToQueue } from "../queues/emailQueue.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentInfo, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items provided" });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
            return res.status(400).json({ error: "Complete shipping address is required" });
        }

        // Generate unique order number
        const orderNumber = `SHOPX-${Math.floor(100000 + Math.random() * 900000)}`;

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentInfo: {
                status: paymentInfo?.status || "Paid",
                cardLastFour: paymentInfo?.cardLastFour || "••••",
                paymentMethod: paymentInfo?.paymentMethod || "Card"
            },
            totalPrice: Number(totalPrice),
            orderNumber,
            orderStatus: "Pending"
        });

        // Enqueue Order Confirmation Email
        try {
            const itemsListText = orderItems
                .map(item => `- ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`)
                .join("\n");

            const emailMessage = `Hi ${req.user.name},\n\nThank you for shopping with SHOPx! Your order has been placed successfully.\n\nOrder Details:\nOrder ID: ${orderNumber}\nTotal Price: $${Number(totalPrice).toFixed(2)}\nEstimated Delivery: 3 to 5 business days\n\nItems Purchased:\n${itemsListText}\n\nShipping Destination:\n${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zip}\n\nWe will update you as soon as your order has been shipped.\n\nBest regards,\nSHOPx Support Team`;

            await addEmailToQueue({
                email: req.user.email,
                subject: `Order Confirmation - ${orderNumber}`,
                message: emailMessage
            });
            console.log(`Order confirmation email queued for ${req.user.email}`);
        } catch (emailError) {
            console.error("Failed to queue order email:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Access check: only user who placed it or an admin can access
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ error: "Failed to fetch order details" });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ error: "Failed to fetch all orders" });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status field is required" });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};
