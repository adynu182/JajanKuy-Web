import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, getMessagingInstance } from '../config/firebase';
import { getToken } from 'firebase/messaging';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * Request notification permission and register FCM token.
 * @param {string} userId - UID of the user
 * @param {'sellers' | 'buyers'} collectionName - Collection to store token in
 * @returns {string|null} FCM token or null if denied
 */
export async function registerForNotifications(userId, collectionName) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('FCM not supported');
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      // Store token in user's document
      await updateDoc(doc(db, collectionName, userId), {
        fcmTokens: arrayUnion(token),
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return null;
  }
}

/**
 * Remove a specific FCM token (e.g., on logout).
 */
export async function unregisterToken(userId, collectionName, token) {
  try {
    await updateDoc(doc(db, collectionName, userId), {
      fcmTokens: arrayRemove(token),
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
}

/**
 * Check if browser supports notifications.
 */
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission state.
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'granted' | 'denied' | 'default'
}
