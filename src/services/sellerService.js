import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { encodeGeohash, getGeohashRange } from './geoService';
import { STATUS, AUTO_EXPIRE_HOURS } from '../utils/constants';

/**
 * Create a new seller profile in Firestore.
 */
export async function createSellerProfile(uid, data) {
  const geohash = data.location
    ? encodeGeohash(data.location.lat, data.location.lng)
    : '';

  const sellerData = {
    name: data.name,
    businessType: data.businessType,
    mode: data.mode,
    vehicleType: data.vehicleType,
    schedule: data.schedule || [],
    status: STATUS.CLOSED,
    location: data.location || null,
    locationSource: null,
    geohash,
    lastUpdate: serverTimestamp(),
    createdAt: serverTimestamp(),
    fcmTokens: [],
    authProvider: 'google',
    email: data.email || '',
  };

  await setDoc(doc(db, 'sellers', uid), sellerData);
  return sellerData;
}

/**
 * Get a seller by ID.
 */
export async function getSellerById(sellerId) {
  const sellerDoc = await getDoc(doc(db, 'sellers', sellerId));
  if (!sellerDoc.exists()) return null;
  return { id: sellerDoc.id, ...sellerDoc.data() };
}

/**
 * Update seller status (buka/tutup) with location.
 */
export async function updateSellerStatus(uid, status, location = null, locationSource = 'gps') {
  const updateData = {
    status,
    lastUpdate: serverTimestamp(),
  };

  if (status === STATUS.OPEN && location) {
    updateData.location = { lat: location.lat, lng: location.lng };
    updateData.locationSource = locationSource;
    updateData.geohash = encodeGeohash(location.lat, location.lng);
  }

  await updateDoc(doc(db, 'sellers', uid), updateData);
}

/**
 * Update seller profile fields.
 */
export async function updateSellerProfile(uid, data) {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.businessType !== undefined) updateData.businessType = data.businessType;
  if (data.mode !== undefined) updateData.mode = data.mode;
  if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;

  await updateDoc(doc(db, 'sellers', uid), updateData);
}

/**
 * Update seller schedule.
 */
export async function updateSellerSchedule(uid, schedule) {
  await updateDoc(doc(db, 'sellers', uid), { schedule });
}

/**
 * Get all sellers within the auto-expire window (12 hours).
 * Filters applied client-side for flexibility.
 */
export async function getSellers(filters = {}) {
  const sellersRef = collection(db, 'sellers');

  // Base query — get all sellers
  const q = query(sellersRef);
  const snapshot = await getDocs(q);

  const now = Date.now();
  const expireMs = AUTO_EXPIRE_HOURS * 60 * 60 * 1000;

  let sellers = [];

  snapshot.forEach((doc) => {
    const data = { id: doc.id, ...doc.data() };

    // Auto-expire: skip sellers with lastUpdate > 12 hours
    if (data.lastUpdate) {
      const lastUpdateMs = data.lastUpdate.toDate
        ? data.lastUpdate.toDate().getTime()
        : new Date(data.lastUpdate).getTime();
      if (now - lastUpdateMs > expireMs) return;
    }

    sellers.push(data);
  });

  // Apply filters
  if (filters.status) {
    sellers = sellers.filter((s) => s.status === filters.status);
  }
  if (filters.mode) {
    sellers = sellers.filter((s) => s.mode === filters.mode);
  }
  if (filters.businessType) {
    sellers = sellers.filter(
      (s) => s.businessType?.toLowerCase().includes(filters.businessType.toLowerCase())
    );
  }

  return sellers;
}

/**
 * Get sellers within a radius of the given coordinates.
 */
export async function getSellersNearby(lat, lng, radiusKm = 5) {
  const { lower, upper } = getGeohashRange(lat, lng, radiusKm);

  const sellersRef = collection(db, 'sellers');
  const q = query(
    sellersRef,
    where('geohash', '>=', lower),
    where('geohash', '<=', upper + '\uf8ff')
  );

  const snapshot = await getDocs(q);
  const now = Date.now();
  const expireMs = AUTO_EXPIRE_HOURS * 60 * 60 * 1000;
  const sellers = [];

  snapshot.forEach((doc) => {
    const data = { id: doc.id, ...doc.data() };
    if (data.lastUpdate) {
      const lastUpdateMs = data.lastUpdate.toDate
        ? data.lastUpdate.toDate().getTime()
        : new Date(data.lastUpdate).getTime();
      if (now - lastUpdateMs > expireMs) return;
    }
    sellers.push(data);
  });

  return sellers;
}

/**
 * Create a pending notification record when seller toggles "Buka".
 * GitHub Actions cron will pick this up and send FCM.
 */
export async function createPendingNotification(sellerId, sellerName) {
  const notifId = `${sellerId}_${Date.now()}`;
  await setDoc(doc(db, 'pendingNotifications', notifId), {
    sellerId,
    sellerName,
    type: 'seller_open',
    createdAt: serverTimestamp(),
    processed: false,
  });
}
