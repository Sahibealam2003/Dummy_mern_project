import messaging from "../config/firebase.js";

export const sendNotification = async (fcmToken, title, body) => {
  // Validate token
  if (!fcmToken || fcmToken === "none") {
    console.log("sendNotification skipped: token is", fcmToken || "missing");
    return;
  }

  try {
    const message = {
      token: fcmToken,

      data: {
        title,
        body,

        icon: "/logo-192.png",

        badge: "/badge-72.png",

        image: "/images/order-banner.png",

        url: "/orders",
      },
    };

    const response = await messaging.send(message);

    console.log("Notification sent:", response);
  } catch (error) {
    console.log("Notification error:", error.message);
  }
};
