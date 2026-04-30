import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const USE_REAL_FIREBASE = process.env.USE_REAL_FIREBASE === 'true';

if (!admin.apps.length && USE_REAL_FIREBASE) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp();
    }
    console.log('Firebase Admin initialized (real mode)');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else if (!USE_REAL_FIREBASE) {
  console.log('Firebase Admin running in TEST MODE: tokens are mocked');
}

// TEST MODE: Bypass actual Firebase authentication for development
// Replace with real Firebase Admin SDK in production

export default USE_REAL_FIREBASE
  ? admin
  : {
      auth: () => ({
        verifyIdToken: async (token) => {
          if (!token) throw new Error('No token');
          return {
            uid: token,
            email: `${token}@test.com`,
            name: `Test User ${token}`,
          };
        },
      }),
    };