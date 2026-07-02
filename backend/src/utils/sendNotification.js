import messaging from "../config/firebase.js";

export const sendNotification = async (fcmToken, title, body) => {
  if (!fcmToken || fcmToken === "none") {
    console.log("❌ FCM Token missing");
    return;
  }

  try {
    const message = {
      token: fcmToken,

      notification: {
        title,
        body,
      },

      webpush: {
        headers: {
          Urgency: "high",
        },

        notification: {
          title,
          body,
          icon: "http://localhost:5173/logo-192.png",
          badge: "http://localhost:5173/badge-72.png",
          image: "http://localhost:5173/images/order-banner.png",
          requireInteraction: true,
          tag: `order-${Date.now()}`
        },

        fcmOptions: {
          link: "http://localhost:5173/orders",
        },
      },
    };

    console.log("========== FCM ==========");
    console.log("Token:", fcmToken);
    console.log(JSON.stringify(message, null, 2));

    const response = await messaging.send(message);

    console.log("Firebase Response:", response);
  } catch (error) {
    console.error("FCM Error:", error);
  }
};
