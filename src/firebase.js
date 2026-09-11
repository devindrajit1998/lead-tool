// Firebase Configuration with dynamic fallback & local configuration support
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Default config check from env
const getEnvConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && apiKey !== 'YOUR_API_KEY') {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }
  return null;
};

// Check if user entered config in UI settings
export const getActiveFirebaseConfig = () => {
  const envConfig = getEnvConfig();
  if (envConfig && envConfig.projectId) return envConfig;

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
  return null;
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
    console.log('✅ Firebase initialized successfully with project:', activeConfig.projectId);
  } catch (err) {
    console.warn('⚠️ Could not initialize Firebase, falling back to Local Storage mode:', err);
    db = null;
  }
}

export const isFirebaseConnected = () => !!db;
export { db };
