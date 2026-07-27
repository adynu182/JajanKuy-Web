import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Follow a seller.
 * Document ID = {buyerId}_{sellerId} for uniqueness.
 */
export async function followSeller(buyerId, sellerId, sellerName) {
  const followId = `${buyerId}_${sellerId}`;
  await setDoc(doc(db, 'follows', followId), {
    buyerId,
    sellerId,
    sellerName,
    createdAt: serverTimestamp(),
  });
}

/**
 * Unfollow a seller.
 */
export async function unfollowSeller(buyerId, sellerId) {
  const followId = `${buyerId}_${sellerId}`;
  await deleteDoc(doc(db, 'follows', followId));
}

/**
 * Check if a buyer is following a seller.
 */
export async function isFollowing(buyerId, sellerId) {
  const followId = `${buyerId}_${sellerId}`;
  const docRef = doc(db, 'follows', followId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

/**
 * Get all sellers followed by a buyer.
 */
export async function getFollowedSellers(buyerId) {
  const followsRef = collection(db, 'follows');
  const q = query(
    followsRef,
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const follows = [];
  snapshot.forEach((doc) => {
    follows.push({ id: doc.id, ...doc.data() });
  });
  return follows;
}

/**
 * Get all followers (buyer IDs) of a seller.
 */
export async function getSellerFollowers(sellerId) {
  const followsRef = collection(db, 'follows');
  const q = query(followsRef, where('sellerId', '==', sellerId));
  const snapshot = await getDocs(q);
  const followers = [];
  snapshot.forEach((doc) => {
    followers.push(doc.data().buyerId);
  });
  return followers;
}
