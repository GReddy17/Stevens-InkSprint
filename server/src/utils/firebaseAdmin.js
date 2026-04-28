// import admin from 'firebase-admin';
// import dotenv from 'dotenv';

// dotenv.config();

// if (!admin.apps.length) {
//   try {
//     if (process.env.FIREBASE_PRIVATE_KEY) {
//       const serviceAccount = {
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       };
//       admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
//     } else {
//       admin.initializeApp();
//     }
//     console.log('Firebase Admin initialized');
//   } catch (error) {
//     console.error('Firebase Admin initialization error:', error);
//   }
// }

// export default admin;

// TEST MODE: Bypass actual Firebase authentication for development
// Replace with real Firebase Admin SDK in production

export default {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Accept any non-empty token and return a mock decoded token
      if (!token) throw new Error('No token');
      // Mock user data (you can adjust as needed)
      return {
        uid: 'test-firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
      };
    },
  }),
};