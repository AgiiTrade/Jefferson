// ===== PNP HOMES PORTAL — FIREBASE CONFIGURATION =====
//
// IMPORTANT: Replace ALL placeholder values below with your real Firebase
// project configuration BEFORE going live.
//
// SECURITY NOTE: Firebase web API keys are safe to include in client-side
// code — they identify your project, not authenticate it. Real security
// comes from Firestore Rules (firestore.rules) which enforce per-user access.
//
// HOW TO GET YOUR CONFIG:
//   1. Firebase Console (console.firebase.google.com)
//   2. Project Settings → General → Your apps → Web app
//   3. Click "</>" to register a web app if you haven't already
//   4. Copy the firebaseConfig object and paste the values below
//
// DO NOT commit credentials like service account keys to git.

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyOHUazPmeRZNgVANpFQYidfCMwwpgReh1E",
  authDomain:        "pnphomes-97242.firebaseapp.com",
  projectId:         "pnphomes-97242",
  storageBucket:     "pnphomes-97242.firebasestorage.app",
  messagingSenderId: "884516668546",
  appId:             "1:884516668546:web:32a04e0bb76f5598eb3993",
  measurementId:     "G-YC9556DXMD"
};

// Guard against double-initialization (e.g. if script is loaded twice)
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const db   = firebase.firestore();
const auth = firebase.auth();
