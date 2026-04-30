import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../services/api';

// Your Firebase config (get from Firebase Console)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const useFCM = () => {
  const [permission, setPermission] = useState(false);
  const [token, setToken] = useState(null);

  const requestPermission = async () => {
    try {
      const permissionStatus = await Notification.requestPermission();
      setPermission(permissionStatus === 'granted');
      
      if (permissionStatus === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        });
        
        if (currentToken) {
          setToken(currentToken);
          // Save token to backend
          await api.post('/notifications/fcm-token', { fcmToken: currentToken });
          console.log('FCM Token saved:', currentToken);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const onMessageListener = () => {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  };

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermission(true);
        // Get existing token
        getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
          .then(currentToken => {
            if (currentToken) {
              setToken(currentToken);
            }
          });
      } else if (Notification.permission !== 'denied') {
        requestPermission();
      }
    }
  }, []);

  return { permission, token, requestPermission, onMessageListener, messaging };
};