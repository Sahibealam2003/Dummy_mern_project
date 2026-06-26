import Order from "../models/orderModel.js";
import { emailQueue } from "../queues/emailQueue.js";
import Cart from "../models/cartModel.js";

import { sendNotification } from "../utils/sendNotification.js";
import { tryCatch } from "bullmq";

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

        try {
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log(`Database cart cleared for user: ${req.user.email}`);
        } catch (cartClearErr) {
            console.error("Failed to clear database cart on checkout:", cartClearErr);
        }

        //Push Notification
        try {

            await sendNotification(
                req.user.fcmToken,
                "Order Status",
                "Your Order Under Processing"
            );

            console.log('Notification sent successfully')
        } catch (error) {
            console.log(error.message)
        }



        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });


        try {
            await emailQueue.add("sendEmail", {
                type: "ORDER_UNDER_PROCESSING",
                data: {
                    email: req.user.email,
                    name: order.user.name
                }
            })
            console.log(`Order confirmation email queued for ${req.user.email}`);
        } catch (emailError) {
            console.error("Failed to queue order email:", emailError);
        }
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

        const order = await Order.findById(req.params.id).populate("user", "name email fcmToken");

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.orderStatus = status;
        await order.save();

        try {
            switch (status) {
                case "Processing":
                    try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Under Processing"
                        );
                        console.log('Processing notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }
                    await emailQueue.add('sendEmail', {
                        type: "PROCESSING_ORDER",
                        data: {
                            email: order.user.email,
                            orderNumber: order.orderNumber,
                            totalPrice: order.orderItems.totalPrice
                        }
                    })
                    console.log("Processing email queued");
                    break

                case "Placed":

                    try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Placed"
                        );
                        console.log('Placed notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }
                    await emailQueue.add('sendEmail', {
                        type: "PLACED_ORDER",
                        data: {
                            email: order.user.email,
                            customerName: order.user.name,

                            orderNumber: order.orderNumber,

                            totalAmount: order.totalPrice,

                            address: `${order.shippingAddress.address}, 
                                    ${order.shippingAddress.city}, 
                                    ${order.shippingAddress.zip}`,
                            products: order.orderItems
                        }
                    })
                    console.log("Placed email queued");
                    break;

                case "Shipped":

                    try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Has Been Shipped"
                        );
                        console.log('Shipped notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }

                    await emailQueue.add('sendEmail', {
                        type: "SHIPPED_ORDER",
                        data: {
                            email: order.user.email,
                            customerName: order.user.name,

                            orderNumber: order.orderNumber,

                            totalAmount: order.totalPrice,

                            address: `${order.shippingAddress.address}, 
                                    ${order.shippingAddress.city}, 
                                    ${order.shippingAddress.zip}`,
                            products: order.orderItems
                        }
                    })
                    console.log("Shipped email queued");
                    break;

                case "Delivered":

                    try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Has Been Delivered"
                        );
                        console.log('Delivered notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }

                    await emailQueue.add('sendEmail', {
                        type: "DELIVERED_EMAIL",
                        data: {
                            email: order.user.email,
                            customerName: order.user.name,

                            orderNumber: order.orderNumber,

                            totalAmount: order.totalPrice,

                            address: `${order.shippingAddress.address}, 
                                    ${order.shippingAddress.city}, 
                                    ${order.shippingAddress.zip}`,
                            products: order.orderItems
                        }
                    })
                    console.log("Delivered email queued");
                    break;

                case "Cancelled":
                    try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Has Been Cancelled"
                        );
                        console.log('Cancelled notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }
                    await emailQueue.add('sendEmail', {
                        type: "CANCEL_ORDER",
                        data: {
                            email: order.user.email,
                            name: order.user.name,
                            orderId: order.orderNumber,
                            totalAmount: order.totalPrice
                        }
                    });
                    console.log("Cancelled email queued");
                    break;

            }
        } catch (error) {

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
        const order = await Order.findById(req.params.id).populate("user", "name email fcmToken")
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
         try {
                        await sendNotification(
                            order.user.fcmToken,
                            "Order Status",
                            "Your Order Has Been Cancelled"
                        );
                        console.log('Cancelled notification sent successfully')

                    } catch (error) {
                        console.log("error")
                    }
        await emailQueue.add("email", {
            type: "CANCEL_ORDER",
            data: {
                email: order.user.email,
                name: order.user.name,
                orderId: order.orderNumber,
                totalAmount: order.totalPrice
            }
        })
        return res.status(200).json({ success: true, message: "Order cancelled successfully", order })
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
}


//Delete order 
export const deleteOrder = async (req,res) => {
    try {
        const {id} = req.params;
        if(!id)
            return res.status(400).json({error:"Order ID is required"})

        const order = await Order.findById(id);
        if(!order)
            return res.status(404).json({error:"Order not found"});
        
        if (order.orderStatus === "pending" || order.orderStatus === "processing") {
          return res.status(400).json({ error: "Cannot delete order that is pending ,placed, processing and shipped"});
        }
        await Order.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
}