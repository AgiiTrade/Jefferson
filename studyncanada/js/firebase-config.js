// Firebase Configuration for StudynCanada
// TODO: Replace with your actual Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "studyncanada.firebaseapp.com",
  projectId: "studyncanada",
  storageBucket: "studyncanada.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Auth Functions
export const authFunctions = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Facebook Sign In
  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Apple Sign In
  signInWithApple: async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Guest/Anonymous Sign In
  signInAsGuest: async () => {
    try {
      const result = await signInAnonymously(auth);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Email/Password Sign Up
  signUpWithEmail: async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Email/Password Sign In
  signInWithEmail: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Auth State Observer
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

export { auth };
