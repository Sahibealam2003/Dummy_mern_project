// SW Version: 2.0 — Forces browser to update cached service worker
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

// Single unified notificationclick handler
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // If action is 'close', just close the notification
  if (event.action === "close") {
    return;
  }

  var urlToOpen = "/orders";
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        // If a window is already open, focus it and navigate
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (
            client.url.indexOf(self.location.origin) !== -1 &&
            "focus" in client
          ) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Otherwise open a new window
        return clients.openWindow(urlToOpen);
      }),
  );
});

// Force immediate activation — skip waiting for old SW to die
self.addEventListener("install", function (event) {
  console.log("[SW v2] Installing...");
  self.skipWaiting();
});

// Claim all clients immediately
self.addEventListener("activate", function (event) {
  console.log("[SW v2] Activated!");
  event.waitUntil(clients.claim());
});