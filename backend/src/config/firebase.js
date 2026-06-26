import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };


initializeApp({
    credential: cert(serviceAccount)
});

const messaging = getMessaging();

export default messaging;