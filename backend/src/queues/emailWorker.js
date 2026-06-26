import dotenv from "dotenv";

dotenv.config();
import { Worker } from "bullmq";
import transporter from "../config/mail.js";
import redis from "../config/redis.js";

import { deliveredEmail, orderUnderProcessingEmail, placedEmail, processingEmail, resetPasswordEmail, shippedEmail, welcomeEmail } from "../utils/emails.js";
import { orderCancelEmail } from "../utils/emails.js";

const worker = new Worker(
    'emailQueue',
    async (job) => {
        const { type, data } = job.data
        let email;
        switch (type) {
            case "WELCOME": email = welcomeEmail(data)
                break

            case "CANCEL_ORDER": email = orderCancelEmail(data)
                break

            case "PLACED_ORDER": email = placedEmail(data)
                break

            case "PROCESSING_ORDER": email = processingEmail(data)
                break

            case "SHIPPED_ORDER": email = shippedEmail(data)
                break

            case "DELIVERED_EMAIL": email = deliveredEmail(data)
                break

            case "RESET_PASSWORD":
                email = resetPasswordEmail(data);
                break;

            case "ORDER_UNDER_PROCESSING":
                email = orderUnderProcessingEmail(data);
                break

        }
        await transporter.sendMail({
            from: process.env.SMTP_MAIL,
            to: data.email,
            subject: email.subject,
            html: email.html
        })
    },
    {
        connection: redis
    }
)

worker.on("completed", (job) => {
    console.log('Email send', job.id)
})

worker.on("failed", (job, error) => {
    console.log('Email not send', error.message)
})
export default worker