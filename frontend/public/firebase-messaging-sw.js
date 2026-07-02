importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAp26Ws_hZh1SYli_ijUQNTvLqcs611iFA",
  authDomain: "mern-demo-31be5.firebaseapp.com",
  projectId: "mern-demo-31be5",
  storageBucket: "mern-demo-31be5.firebasestorage.app",
  messagingSenderId: "453702666655",
  appId: "1:453702666655:web:90ba5cbd80c0138388d5aa",
  measurementId: "G-3PLQE6X6Q4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Payload:", payload);

  const notificationTitle = payload.data.title;

  const notificationOptions = {
    body: payload.data.body,

    icon: payload.data.icon,

    badge: payload.data.badge,

    image: payload.data.image,

    requireInteraction: true,

    tag: "order-notification",

    data: {
      url: payload.data.url,
    },

    actions: [
      {
        action: "view-order",
        title: "📦 View Order",
      },
      {
        action: "close",
        title: "❌ Close",
      },
    ],
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

self.addEventListener("notificationclick", (event) => {

    event.notification.close();

    if (event.action === "view-order") {

        event.waitUntil(
            clients.openWindow("/orders")
        );

    }

});