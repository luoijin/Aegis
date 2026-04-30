const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Option 1: Using service account JSON file (recommended for production)
  // Download from Firebase Console -> Project Settings -> Service Accounts
  const serviceAccount = require('./firebase-service-account.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  // Option 2: Using environment variables (simpler for school project)
  // admin.initializeApp({
  //   credential: admin.credential.cert({
  //     projectId: process.env.FIREBASE_PROJECT_ID,
  //     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  //     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  //   })
  // });
}

const sendPushNotification = async (fcmToken, title, body, data = {}, clickAction = '/') => {
  if (!fcmToken) {
    console.log('No FCM token provided');
    return null;
  }

  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
        clickAction
      },
      data: {
        ...data,
        clickAction,
        timestamp: new Date().toISOString()
      }
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification sent to ${fcmToken.substring(0, 20)}...:`, response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    // If token is invalid, remove it from database
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      return { invalidToken: true };
    }
    return null;
  }
};

const broadcastToRole = async (role, title, body, data = {}, excludeUserId = null) => {
  const User = require('../models/User.model');
  const users = await User.find({ 
    role, 
    fcmToken: { $ne: null, $exists: true },
    ...(excludeUserId && { _id: { $ne: excludeUserId } })
  });
  
  const tokens = users.map(u => u.fcmToken).filter(Boolean);
  
  if (tokens.length === 0) return [];
  
  try {
    const response = await admin.messaging().sendEach(
      tokens.map(token => ({
        token,
        notification: { title, body },
        data
      }))
    );
    return response.responses;
  } catch (error) {
    console.error('Error broadcasting:', error);
    return [];
  }
};

module.exports = { admin, sendPushNotification, broadcastToRole };