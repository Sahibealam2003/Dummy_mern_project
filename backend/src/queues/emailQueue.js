import { Queue } from "bullmq";
import IORedis from "ioredis";


const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null 
});

connection.on("error", (err) => {
    console.error("Redis Connection Error in Email Queue:", err);
});


export const emailQueue = new Queue("EmailQueue", { connection });


export const addEmailToQueue = async (emailData) => {
    await emailQueue.add("sendWelcomeEmail", emailData, {
        attempts: 3, 
        backoff: 5000 
    });
};
