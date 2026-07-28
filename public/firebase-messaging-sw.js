// Firebase Cloud Messaging Service Worker
// This runs in the background to receive push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// TODO: file ini statis, tidak diproses Vite — kalau ganti project Firebase, update manual di sini juga
firebase.initializeApp({
  apiKey: 'AIzaSyBvjk2NRrxJ1T-FuMYEG3iVAhEIi37xgYk',
  authDomain: 'jajankuy-web.firebaseapp.com',
  projectId: 'jajankuy-web',
  storageBucket: 'jajankuy-web.firebasestorage.app',
  messagingSenderId: '439643042694',
  appId: '1:439643042694:web:1836b8bcd25b97915ff207',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const notificationTitle = payload.notification?.title || 'Jajankuy';
  const notificationOptions = {
    body: payload.notification?.body || 'Ada update baru!',
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    tag: payload.data?.tag || 'jajankuy-notification',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Buka' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data?.sellerId) {
    url = `/seller/${data.sellerId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
