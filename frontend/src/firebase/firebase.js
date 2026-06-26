import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAp26Ws_hZh1SYli_ijUQNTvLqcs611iFA",
    authDomain: "mern-demo-31be5.firebaseapp.com",
    projectId: "mern-demo-31be5",
    storageBucket: "mern-demo-31be5.firebasestorage.app",
    messagingSenderId: "453702666655",
    appId: "1:453702666655:web:90ba5cbd80c0138388d5aa",
    measurementId: "G-3PLQE6X6Q4"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
