import dotenv from "dotenv";
import { Emitter } from "@socket.io/redis-emitter";
dotenv.config();
import { Worker } from "bullmq";
import transporter from "../config/mail.js";
import { redisConnection } from "../config/redis.js";
import { sendNotification } from "../utils/sendNotification.js";
import {
  deliveredEmail,
  orderUnderProcessingEmail,
  placedEmail,
  processingEmail,
  resetPasswordEmail,
  shippedEmail,
  welcomeEmail,
} from "../utils/emails.js";
import { orderCancelEmail } from "../utils/emails.js";
const io = new Emitter(redisConnection);
const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { type, data } = job.data;
    let email;
    switch (type) {
      case "WELCOME":
        email = welcomeEmail(data);
        break;

      case "CANCEL_ORDER":
        email = orderCancelEmail(data);
        break;

      case "PLACED_ORDER":
        email = placedEmail(data);
        break;

      case "PROCESSING_ORDER":
        email = processingEmail(data);
        break;

      case "SHIPPED_ORDER":
        email = shippedEmail(data);
        break;

      case "DELIVERED_EMAIL":
        email = deliveredEmail(data);
        break;

      case "RESET_PASSWORD":
        email = resetPasswordEmail(data);
        break;

      case "ORDER_NOTIFICATION":
        await sendNotification(
          data.fcmToken,
          "Order Status",
          "Your order is under processing",
        );

        // Website realtime notification

        io.to(data.userId).emit("orderUpdate", {
          message: "Your order is under processing",
          orderId: data.orderId,
        });

        email = orderUnderProcessingEmail(data);

        break;

        email = orderUnderProcessingEmail(data);

        break;

      case "CRM_MESSAGE":
        email = {
          subject: data.subject,
          html: data.html,
        };
        break;
    }
    await transporter.sendMail({
      from: process.env.SMTP_MAIL,
      to: data.email,
      subject: email.subject,
      html: email.html,
    });
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log("Email send", job.id);
});

worker.on("failed", (job, error) => {
  console.log("Email not send", error.message);
});
export default worker;
