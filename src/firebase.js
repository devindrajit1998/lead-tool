// Firebase Configuration for LeadFlow
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Default Firebase Project Configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBozCbg7T0uzGHWjtK75728CZr2sudXMvc",
  authDomain: "lead-hub-fee56.firebaseapp.com",
  projectId: "lead-hub-fee56",
  storageBucket: "lead-hub-fee56.firebasestorage.app",
  messagingSenderId: "282439274538",
  appId: "1:282439274538:web:23a0e6578c6983b23a3353",
  measurementId: "G-3S63J03KHE"
};

// Check if environment variables or local overrides are present
export const getActiveFirebaseConfig = () => {
  // 1. Check in-browser custom configuration
  try {
    const stored = localStorage.getItem('leadflow_firebase_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored Firebase config', e);
  }

  // 2. Check environment variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envApiKey && envApiKey.length > 5) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
    };
  }

  // 3. Fallback to default project configuration
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem('leadflow_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem('leadflow_firebase_config');
  window.location.reload();
};

let db = null;
let firebaseApp = null;
const activeConfig = getActiveFirebaseConfig();

if (activeConfig && activeConfig.projectId) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    db = getFirestore(firebaseApp);
    console.log('✅ Firebase Cloud Firestore connected to project:', activeConfig.projectId);
  } catch (err) {
    console.warn('⚠️ Could not initialize Firebase Cloud Firestore, using Local Storage mode:', err);
    db = null;
  }
}

export const isFirebaseConnected = () => !!db;
export { db };
