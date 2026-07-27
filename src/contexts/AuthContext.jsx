import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'seller' | 'buyer' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Check if user is a registered seller
        try {
          const sellerDoc = await getDoc(doc(db, 'sellers', firebaseUser.uid));
          if (sellerDoc.exists()) {
            setUserProfile(sellerDoc.data());
            setUserRole('seller');
          } else {
            // Check if they're a buyer
            const buyerDoc = await getDoc(doc(db, 'buyers', firebaseUser.uid));
            if (buyerDoc.exists()) {
              setUserProfile(buyerDoc.data());
              setUserRole('buyer');
            } else {
              setUserRole(null);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const ensureBuyerProfile = async () => {
    if (!user) return;
    const buyerRef = doc(db, 'buyers', user.uid);
    const buyerDoc = await getDoc(buyerRef);
    if (!buyerDoc.exists()) {
      await setDoc(buyerRef, {
        authProvider: 'google',
        fcmTokens: [],
        createdAt: serverTimestamp(),
      });
      setUserRole('buyer');
    }
  };

  const refreshSellerProfile = async () => {
    if (!user) return;
    const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
    if (sellerDoc.exists()) {
      setUserProfile(sellerDoc.data());
      setUserRole('seller');
    }
  };

  const value = {
    user,
    userProfile,
    userRole,
    loading,
    signInWithGoogle,
    signOut,
    ensureBuyerProfile,
    refreshSellerProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
