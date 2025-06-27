// src/lib/firebase/clientApp.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC-7MgkEby5G7TOH05Z99DYckD3RtNHjbA",
  authDomain: "huashang-hais-app.firebaseapp.com",
  projectId: "huashang-hais-app",
  storageBucket: "huashang-hais-app.firebasestorage.app",
  messagingSenderId: "56335633216",
  appId: "1:56335633216:web:729505dbf83f40f357c8a5",
  measurementId: "G-2WV3LNQF94"
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let firebaseInitializedSuccessfully = false;

// Check if all necessary Firebase config keys are present
const hasRequiredConfig = 
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    firebaseConfig.authDomain;

// Initialize Firebase only on the client side and if config is present
if (typeof window !== 'undefined' && hasRequiredConfig) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      firebaseInitializedSuccessfully = true;
    } catch (e: any) {
      console.error("Firebase initialization failed:", e.message);
      firebaseInitializedSuccessfully = false;
    }
  } else {
    app = getApp();
    firebaseInitializedSuccessfully = true;
  }
} else if (typeof window !== 'undefined' && !hasRequiredConfig) {
    // Log a warning on the client side if config is missing
    console.warn("Firebase configuration is missing. The application will not be able to connect to Firebase services. Please ensure your NEXT_PUBLIC_FIREBASE_* environment variables are set correctly.");
}

// Assign services only if initialization was successful
if (firebaseInitializedSuccessfully && app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch(e: any) {
    console.error("Error getting Firebase services:", e.message);
    firebaseInitializedSuccessfully = false;
    auth = null;
    db = null;
    storage = null;
  }
}

export { app, db, auth, storage, firebaseInitializedSuccessfully };
