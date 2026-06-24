import Order from "../models/orderModel.js";
import { addEmailToQueue, emailQueue } from "../queues/emailQueue.js";
import { addOrderTransitionToQueue } from "../queues/orderQueue.js";
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
                status: paymentInfo?.status || "Pending",
                cardLastFour: paymentInfo?.cardLastFour || "••••",
                paymentMethod: paymentInfo?.paymentMethod || "Card",
                paymentMode: paymentInfo?.paymentMode || "Online"
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
            const paymentDetails = `${paymentInfo?.paymentMethod || "Card"} (${paymentInfo?.paymentMode || "Online"})`;
            const emailMessage = `Hi ${req.user.name},\n\nThank you for shopping with SHOPx! Your order has been placed successfully.\n\nOrder Details:\nOrder ID: ${orderNumber}\nSubtotal: $${subtotal.toFixed(2)}\nShipping: ${shipPrice > 0 ? `$${shipPrice.toFixed(2)}` : "FREE"}\nTax (10%): $${tax.toFixed(2)}\nTotal Price: $${Number(totalPrice).toFixed(2)}\nPayment Method: ${paymentDetails}\nEstimated Delivery: 3 to 5 business days\n\nItems Purchased:\n${itemsListText}\n\nShipping Destination:\n${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zip}\n\nWe will update you as soon as your order has been shipped.\n\nBest regards,\nSHOPx Support Team`;

            await addEmailToQueue({
                email: req.user.email,
                subject: `Order Confirmation - ${orderNumber}`,
                message: `Hi ${req.user.name},
    Thank you for shopping with SHOPx!
    Order Details:
    Order ID: ${orderNumber}
    Payment: ${paymentDetails}
    Total Price: $${Number(totalPrice).toFixed(2)}
    Items Purchased:
    ${itemsListText}
    Thank you,
    SHOPx Support Team`
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
            try {
                await addOrderTransitionToQueue(order._id, "Shipped", 1 * 60 * 1000);
                console.log(`[Queue-Delivery] Order ${order.orderNumber} status transition to Shipped enqueued.`);
            } catch (queueErr) {
                console.error(`[Queue-Delivery Error] Failed to enqueue transition for order ${order.orderNumber}:`, queueErr);
            }
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

//Cancel Order
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email")
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You cannot cancel this order" })
        }
        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return res.status(400).json({ error: "you cannot cancel this order as its already shipped or delivered" })
        }
        order.orderStatus = 'Cancelled'
        await order.save()

        await addEmailToQueue({
            email: order.user.email,
            subject: `order number ${order.orderNumber} has been cancelled`,
            message: `Hi ${order.user.name},
            Your order ${order.orderNumber} has been cancelled successfully.
            Payment Method:
            ${order.paymentInfo.paymentMethod}
            Payment Mode:
            ${order.paymentInfo.paymentMode}
            Thank you for shopping with SHOPx.
            Best Regards,
            SHOPx Support Team`
        })
        return res.status(200).json({ success: true, message: "Order cancelled successfully", order })
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
}