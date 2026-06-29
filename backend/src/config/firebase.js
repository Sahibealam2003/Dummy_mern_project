import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env variable:", error);
    }
}

if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url:
            process.env.FIREBASE_CLIENT_CERT_URL
    };
}

if (!serviceAccount) {
    try {
        const keyPath = path.join(__dirname, "../../serviceAccountKey.json");
        if (fs.existsSync(keyPath)) {
            const rawData = fs.readFileSync(keyPath, "utf8");
            serviceAccount = JSON.parse(rawData);
        } else {
            throw new Error(`serviceAccountKey.json not found at ${keyPath}`);
        }
    } catch (error) {
        console.error("Firebase config error: Unable to load service account credentials.", error);
        process.exit(1);
    }
}

initializeApp({
    credential: cert(serviceAccount)
});

const messaging = getMessaging();

export default messaging;