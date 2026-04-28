import admin from '../utils/firebaseAdmin.js';
import User from '../models/User.js';

/**
 * Middleware to verify Firebase ID token and attach user to context
 * @param {string} token - The Firebase ID token from Authorization header
 * @returns {Promise<Object|null>} - Returns user object from database or null if invalid
 */
export async function authenticateUser(token) {
  if (!token) {
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || email?.split('@')[0];

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      // Create a new user record (role defaults to PARTICIPANT)
      user = await User.create({
        firebaseUid,
        email,
        displayName: name,
        role: 'PARTICIPANT',
      });
    } else {
      if (user.email !== email) user.email = email;
      if (user.displayName !== name) user.displayName = name;
      await user.save();
    }

    return {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
}

/**
 * Helper to extract token from request headers
 * Expects header: Authorization: Bearer <token>
 */
export function extractTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}