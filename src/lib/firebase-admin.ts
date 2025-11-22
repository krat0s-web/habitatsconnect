import * as admin from 'firebase-admin';

function initAdmin() {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } catch (error) {
                console.error('Firebase Admin initialization error', error);
            }
        } else {
            // Fallback for development/build if no service account key is provided
            try {
                admin.initializeApp();
            } catch (e) {
                console.log('Firebase Admin init skipped (no credentials)');
            }
        }
    }
    return admin;
}

// Lazy getters
const getAdminAuth = () => {
    initAdmin();
    return admin.auth();
};

const getAdminDb = () => {
    initAdmin();
    return admin.firestore();
};

// Proxy objects to maintain API compatibility but lazy load
const adminAuth = new Proxy({} as admin.auth.Auth, {
    get: (_target, prop) => {
        return (getAdminAuth() as any)[prop];
    },
});

const adminDb = new Proxy({} as admin.firestore.Firestore, {
    get: (_target, prop) => {
        return (getAdminDb() as any)[prop];
    },
});

export { admin, adminAuth, adminDb };
