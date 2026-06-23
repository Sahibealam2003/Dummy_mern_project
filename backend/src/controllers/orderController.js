import Order from "../models/orderModel.js";
import { addEmailToQueue } from "../queues/emailQueue.js";
import Cart from "../models/cartModel.js";

//Create new order

export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentInfo, totalPrice, shippingPrice } = req.body;

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
            shippingPrice: Number(shippingPrice || 0.0),
            orderNumber,
            orderStatus: "Pending"
        });

        // Clear user database cart on successful order creation
        try {
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log(`Database cart cleared for user: ${req.user.email}`);
        } catch (cartClearErr) {
            console.error("Failed to clear database cart on checkout:", cartClearErr);
        }

        // Enqueue Order Confirmation Email
        try {
            const itemsListText = orderItems
                .map(item => `- ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`)
                .join("\n");

            const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const tax = subtotal * 0.1;
            const shipPrice = Number(shippingPrice || 0.0);

            const emailMessage = `Hi ${req.user.name},\n\nThank you for shopping with SHOPx! Your order has been placed successfully.\n\nOrder Details:\nOrder ID: ${orderNumber}\nSubtotal: $${subtotal.toFixed(2)}\nShipping: ${shipPrice > 0 ? `$${shipPrice.toFixed(2)}` : "FREE"}\nTax (10%): $${tax.toFixed(2)}\nTotal Price: $${Number(totalPrice).toFixed(2)}\nEstimated Delivery: 3 to 5 business days\n\nItems Purchased:\n${itemsListText}\n\nShipping Destination:\n${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zip}\n\nWe will update you as soon as your order has been shipped.\n\nBest regards,\nSHOPx Support Team`;

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

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.orderStatus = status;
        await order.save();

        if (status === "Processing") {
            const orderId = order._id;
            const orderNumber = order.orderNumber;
            setTimeout(async () => {
                try {
                    let foundOrder = await Order.findById(orderId).populate("user", "name email");
                    // 1. Move to Shipped
                    if (foundOrder && foundOrder.orderStatus === "Processing") {
                        foundOrder.orderStatus = "Shipped";
                        await foundOrder.save();
                        console.log(`[Auto-Delivery] Order ${orderNumber} automatically marked as Shipped.`);

                        // 2. Set another timeout to move to Delivered
                        setTimeout(async () => {
                            try {
                                foundOrder = await Order.findById(orderId).populate("user", "name email");
                                if (foundOrder && foundOrder.orderStatus === "Shipped") {
                                    foundOrder.orderStatus = "Delivered";
                                    await foundOrder.save();
                                    console.log(`[Auto-Delivery] Order ${orderNumber} automatically marked as Delivered.`);

                                    const emailMessage = `Hi ${foundOrder.user?.name || "Customer"},\n\nGood news! Your order ${orderNumber} has been delivered successfully.\n\nThank you for shopping with SHOPx!\n\nBest regards,\nSHOPx Support Team`;
                                    
                                    await addEmailToQueue({
                                        email: foundOrder.user?.email,
                                        subject: `Order Delivered - ${orderNumber}`,
                                        message: emailMessage
                                    });
                                    console.log(`[Auto-Delivery] Delivery email enqueued for ${foundOrder.user?.email}`);
                                }
                            } catch (err2) {
                                console.error(`[Auto-Delivery Error] Failed during Delivered phase for order ${orderNumber}:`, err2);
                            }
                        }, 1 * 60 * 1000);
                    }
                } catch (err) {
                    console.error(`[Auto-Delivery Error] Failed during Shipped phase for order ${orderNumber}:`, err);
                }
            }, 1 * 60 * 1000);
        }

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
