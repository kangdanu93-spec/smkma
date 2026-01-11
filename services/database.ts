import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PrincipalData } from '../types';

export interface Registrant {
  id: string;
  name: string;
  schoolOrigin: string;
  phone: string;
  major: string;
  timestamp: string;
}

// --------------------------------------------------------
// KONFIGURASI FIREBASE
// --------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBTk76MRDZBxIBhjpusyVCaYHQA_-S3Qac",
  authDomain: "websmkma.firebaseapp.com",
  databaseURL: "https://websmkma-default-rtdb.firebaseio.com",
  projectId: "websmkma",
  storageBucket: "websmkma.firebasestorage.app",
  messagingSenderId: "804071628426",
  appId: "1:804071628426:web:30a9388ee4a7af0ace5773",
  measurementId: "G-6DNDWFB1RY"
};

// Inisialisasi Firebase
let db: any;
let storage: any;
let isFirebaseInitialized = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn("Firebase Init Error (Using LocalStorage fallback):", error);
}

const COLLECTION_NAME = 'ppdb_registrants';
const CONFIG_COLLECTION = 'school_config';
const PRINCIPAL_DOC_ID = 'principal_data';
const LOCAL_STORAGE_REGISTRANTS_KEY = 'ppdb_registrants_local';
const LOCAL_STORAGE_PRINCIPAL_KEY = 'principal_data_local';

// Helper to convert File to Base64 for local storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const databaseService = {
  // --- PPDB ---
  saveRegistrant: async (data: Omit<Registrant, 'id' | 'timestamp'>): Promise<boolean> => {
    // Try Firebase
    if (isFirebaseInitialized && db) {
      try {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...data,
          timestamp: Timestamp.now()
        });
        return true;
      } catch (e) {
        console.warn("Firebase write failed, falling back to local storage:", e);
      }
    }

    // Fallback Local Storage
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_REGISTRANTS_KEY);
      const registrants: Registrant[] = existingData ? JSON.parse(existingData) : [];
      
      const newRegistrant: Registrant = {
        id: 'local-' + Date.now(),
        ...data,
        timestamp: new Date().toISOString()
      };
      
      registrants.unshift(newRegistrant); // Add to beginning
      localStorage.setItem(LOCAL_STORAGE_REGISTRANTS_KEY, JSON.stringify(registrants));
      return true;
    } catch (e) {
      console.error("Local storage save failed:", e);
      return false;
    }
  },

  getRegistrants: async (): Promise<Registrant[]> => {
    let firebaseResults: Registrant[] = [];
    let firebaseSuccess = false;

    // Try Firebase
    if (isFirebaseInitialized && db) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firebaseResults.push({
            id: doc.id,
            name: data.name,
            schoolOrigin: data.schoolOrigin,
            phone: data.phone,
            major: data.major,
            timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
          });
        });
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase read failed, falling back to local storage:", e);
      }
    }

    // If Firebase succeeded, return firebase results
    if (firebaseSuccess) return firebaseResults;

    // Fallback Local Storage
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_REGISTRANTS_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (e) {
      console.error("Local storage read failed:", e);
      return [];
    }
  },

  // --- KEPALA SEKOLAH ---
  getPrincipalData: async (): Promise<PrincipalData | null> => {
    // Try Firebase
    if (isFirebaseInitialized && db) {
      try {
        const docRef = doc(db, CONFIG_COLLECTION, PRINCIPAL_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as PrincipalData;
        }
      } catch (e) {
        console.warn("Firebase read principal failed, falling back to local storage:", e);
      }
    }

    // Fallback Local Storage
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_PRINCIPAL_KEY);
      if (localData) {
        return JSON.parse(localData) as PrincipalData;
      }
    } catch (e) {
      console.error("Local storage read principal failed:", e);
    }
    return null;
  },

  updatePrincipalData: async (data: PrincipalData): Promise<boolean> => {
    // Try Firebase
    let firebaseSuccess = false;
    if (isFirebaseInitialized && db) {
      try {
        await setDoc(doc(db, CONFIG_COLLECTION, PRINCIPAL_DOC_ID), data);
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase update principal failed, falling back to local storage:", e);
      }
    }

    // Update Local Storage (Always update local as backup/cache)
    try {
      localStorage.setItem(LOCAL_STORAGE_PRINCIPAL_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Local storage update principal failed:", e);
      // If firebase failed too, then return false
      return firebaseSuccess;
    }
  },

  uploadPrincipalPhoto: async (file: File): Promise<string | null> => {
    // Try Firebase Storage
    if (isFirebaseInitialized && storage) {
      try {
        const storageRef = ref(storage, `principal-photos/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (e) {
        console.warn("Firebase storage upload failed, falling back to Base64:", e);
      }
    }

    // Fallback: Convert to Base64
    try {
      return await fileToBase64(file);
    } catch (e) {
      console.error("File conversion failed:", e);
      return null;
    }
  },

  clearDatabase: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_REGISTRANTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PRINCIPAL_KEY);
    console.log("Local database cleared.");
  }
};