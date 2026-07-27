/**
 * GitHub Actions script: Process pending notifications & seller reminders
 *
 * 1. Follower notifications: Check `pendingNotifications` for unprocessed entries,
 *    find followers, and send FCM push.
 * 2. Seller reminders: Check sellers with `lastUpdate` > 6 hours, send reminder.
 *
 * Uses Firebase Admin SDK with service account from GitHub Secrets.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const messaging = admin.messaging();

const REMINDER_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

async function processFollowerNotifications() {
  console.log('=== Processing follower notifications ===');

  const snapshot = await db
    .collection('pendingNotifications')
    .where('processed', '==', false)
    .where('type', '==', 'seller_open')
    .limit(50)
    .get();

  if (snapshot.empty) {
    console.log('No pending notifications.');
    return;
  }

  for (const doc of snapshot.docs) {
    const notif = doc.data();
    console.log(`Processing: ${notif.sellerName} (${notif.sellerId})`);

    try {
      // Find all followers
      const followsSnap = await db
        .collection('follows')
        .where('sellerId', '==', notif.sellerId)
        .get();

      if (followsSnap.empty) {
        console.log('  No followers.');
      } else {
        // Collect FCM tokens from buyers
        const tokens = [];
        for (const followDoc of followsSnap.docs) {
          const buyerId = followDoc.data().buyerId;
          const buyerDoc = await db.collection('buyers').doc(buyerId).get();
          if (buyerDoc.exists && buyerDoc.data().fcmTokens) {
            tokens.push(...buyerDoc.data().fcmTokens);
          }
        }

        if (tokens.length > 0) {
          const message = {
            notification: {
              title: `${notif.sellerName} sedang buka! 🍢`,
              body: `Penjual yang kamu ikuti baru saja buka jualan. Yuk cek lokasinya!`,
            },
            data: {
              sellerId: notif.sellerId,
              tag: `seller-open-${notif.sellerId}`,
            },
            tokens: tokens,
          };

          const response = await messaging.sendEachForMulticast(message);
          console.log(`  Sent to ${response.successCount}/${tokens.length} devices.`);
        }
      }

      // Mark as processed
      await doc.ref.update({ processed: true, processedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (error) {
      console.error(`  Error processing ${doc.id}:`, error.message);
    }
  }
}

async function processSellerReminders() {
  console.log('=== Processing seller reminders ===');

  const thresholdTime = new Date(Date.now() - REMINDER_THRESHOLD_MS);

  const snapshot = await db
    .collection('sellers')
    .where('lastUpdate', '<', thresholdTime)
    .where('status', '==', 'buka')
    .limit(50)
    .get();

  if (snapshot.empty) {
    console.log('No sellers needing reminders.');
    return;
  }

  for (const doc of snapshot.docs) {
    const seller = doc.data();
    console.log(`Reminding: ${seller.name}`);

    if (seller.fcmTokens && seller.fcmTokens.length > 0) {
      try {
        const message = {
          notification: {
            title: 'Jangan lupa update status! ⏰',
            body: `Status "${seller.name}" sudah lebih dari 6 jam tanpa update. Masih jualan? Tap untuk update.`,
          },
          data: {
            type: 'seller_reminder',
            tag: 'seller-reminder',
          },
          tokens: seller.fcmTokens,
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log(`  Sent to ${response.successCount}/${seller.fcmTokens.length} devices.`);
      } catch (error) {
        console.error(`  Error:`, error.message);
      }
    }
  }
}

async function main() {
  try {
    await processFollowerNotifications();
    await processSellerReminders();
    console.log('=== Done ===');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
