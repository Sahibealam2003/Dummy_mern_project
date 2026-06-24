import { Worker } from "bullmq";
import IORedis from "ioredis";
import Order from "../models/orderModel.js";
import { addEmailToQueue } from "./emailQueue.js";
import { addOrderTransitionToQueue } from "./orderQueue.js";

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});

connection.on("error", (err) => {
    console.error("Redis Connection Error in Order Worker:", err);
});

const orderWorker = new Worker("OrderQueue", async (job) => {
    console.log(`Processing Order Job ID: ${job.id}`);
    const { orderId, targetStatus } = job.data;

    try {
        let foundOrder = await Order.findById(orderId).populate("user", "name email");
        if (!foundOrder) {
            console.log(`[Order Worker] Order ${orderId} not found.`);
            return;
        }

        const orderNumber = foundOrder.orderNumber;

        if (targetStatus === "Shipped") {
            if (foundOrder.orderStatus === "Processing") {
                foundOrder.orderStatus = "Shipped";
                await foundOrder.save();
                console.log(`[Auto-Delivery] Order ${orderNumber} automatically marked as Shipped via Queue.`);

                // Schedule next transition to Delivered in 1 minute (60000 ms)
                await addOrderTransitionToQueue(orderId, "Delivered", 1 * 60 * 1000);
            } else {
                console.log(`[Auto-Delivery] Order ${orderNumber} status was not 'Processing' (found: ${foundOrder.orderStatus}). Skipping transition to Shipped.`);
            }
        } else if (targetStatus === "Delivered") {
            if (foundOrder.orderStatus === "Shipped") {
                foundOrder.orderStatus = "Delivered";
                await foundOrder.save();
                console.log(`[Auto-Delivery] Order ${orderNumber} automatically marked as Delivered via Queue.`);

                const emailMessage = `Hi ${foundOrder.user?.name || "Customer"},\n\nGood news! Your order ${orderNumber} has been delivered successfully.\n\nThank you for shopping with SHOPx!\n\nBest regards,\nSHOPx Support Team`;

                await addEmailToQueue({
                    email: foundOrder.user?.email,
                    subject: `Order Delivered - ${orderNumber}`,
                    message: emailMessage
                });
                console.log(`[Auto-Delivery] Delivery email enqueued for ${foundOrder.user?.email}`);
            } else {
                console.log(`[Auto-Delivery] Order ${orderNumber} status was not 'Shipped' (found: ${foundOrder.orderStatus}). Skipping transition to Delivered.`);
            }
        }
    } catch (err) {
        console.error(`[Order Worker Error] Failed processing job for order ${orderId}:`, err);
        throw err;
    }
}, { connection });

orderWorker.on("completed", (job) => {
    console.log(`Order Job ${job.id} has completed successfully!`);
});

orderWorker.on("failed", (job, err) => {
    console.log(`Order Job ${job.id} failed with error: ${err.message}`);
});

export default orderWorker;
