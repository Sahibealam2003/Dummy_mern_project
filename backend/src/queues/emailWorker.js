import { Worker } from "bullmq";
import IORedis from "ioredis";
import sendEmail from "../utils/sendEmail.js"; 

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});

const emailWorker = new Worker("EmailQueue", async (job) => {
    console.log(`Processing Job ID: ${job.id}`);
    const { email, subject, message } = job.data;
    

    await sendEmail({ email, subject, message });
}, { connection });

emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed successfully!`);
});

emailWorker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed with error: ${err.message}`);
});

export default emailWorker;
