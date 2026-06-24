import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});

connection.on("error", (err) => {
    console.error("Redis Connection Error in Order Queue:", err);
});

export const orderQueue = new Queue("OrderQueue", { connection });

export const addOrderTransitionToQueue = async (orderId, targetStatus, delayMs) => {
    await orderQueue.add(
        "transitionStatus",
        { orderId, targetStatus },
        { 
            delay: delayMs,
            attempts: 3,
            backoff: 5000
        }
    );
};
