import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'seller' | 'buyer' | null
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Selesaikan proses login kalau baru saja kembali dari halaman redirect Google.
    // signInWithRedirect gak langsung ngasih hasil di tempat manggilnya — hasilnya
    // baru bisa diambil di sini, setelah halaman reload balik dari Google.
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect sign-in error:', error);
      setAuthError(error);
    });

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
      setAuthError(null);
      // Redirect (bukan popup) — popup gak reliable di mobile browser & PWA standalone.
      // Baris setelah ini gak akan sempat jalan karena halaman langsung navigasi ke Google.
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      setAuthError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        // Isi displayName biar konsisten dengan user yang login lewat Google
        // (mis. buat ditampilkan di Navbar / dashboard).
        await updateProfile(credential.user, { displayName });
      }
      return credential.user;
    } catch (error) {
      console.error('Email sign-up error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setAuthError(null);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    } catch (error) {
      console.error('Email sign-in error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error);
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
        authProvider: user.providerData?.[0]?.providerId === 'password' ? 'email' : 'google',
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
    authError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
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
