import dotenv from 'dotenv';
import admin from './src/utils/firebaseAdmin.js';

dotenv.config();

async function testFirebase() {
  try {
    console.log('Testing Firebase Admin...');
    const customToken = await admin.auth().createCustomToken('test-uid', { email: 'test@test.com' });
    console.log('✅ Custom token generated successfully:', customToken.substring(0, 50) + '...');
    try {
      await admin.auth().verifyIdToken('fake-token');
    } catch (err) {
      if (err.code === 'auth/argument-error') {
        console.log('✅ SDK verification function is callable (expected error on fake token)');
      } else {
        console.log('Unexpected error:', err.message);
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('Check your .env FIREBASE_* variables and private key format');
  }
}

testFirebase();