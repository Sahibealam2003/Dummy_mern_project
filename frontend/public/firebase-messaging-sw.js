importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
   apiKey: "AIzaSyAp26Ws_hZh1SYli_ijUQNTvLqcs611iFA",
    authDomain: "mern-demo-31be5.firebaseapp.com",
    projectId: "mern-demo-31be5",
    storageBucket: "mern-demo-31be5.firebasestorage.app",
    messagingSenderId: "453702666655",
    appId: "1:453702666655:web:90ba5cbd80c0138388d5aa",
    measurementId: "G-3PLQE6X6Q4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
