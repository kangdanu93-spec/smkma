import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { PrincipalData, NewsItem } from '../types';

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
// PENTING: Ganti nilai di bawah ini dengan konfigurasi dari Firebase Console Anda
// (Project Settings -> General -> Your apps -> SDK setup and configuration)
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
let isFirebaseInitialized = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseInitialized = true;
  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase Init Error (Using LocalStorage fallback). Check your firebaseConfig:", error);
}

const COLLECTION_NAME = 'ppdb_registrants';
const CONFIG_COLLECTION = 'school_config';
const NEWS_COLLECTION = 'school_news';
const PRINCIPAL_DOC_ID = 'principal_data';

const LOCAL_STORAGE_REGISTRANTS_KEY = 'ppdb_registrants_local';
const LOCAL_STORAGE_PRINCIPAL_KEY = 'principal_data_local';
const LOCAL_STORAGE_NEWS_KEY = 'school_news_local';

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
        console.warn("Firebase write failed (using LocalStorage fallback). Error:", e);
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
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
          });
        });
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase read failed (using LocalStorage fallback). Error:", e);
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
        console.warn("Firebase read principal failed (using LocalStorage fallback). Error:", e);
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
        console.log("Firebase principal data updated successfully");
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase update principal failed (using LocalStorage fallback). Error:", e);
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

  // --- BERITA / NEWS ---
  getNews: async (): Promise<NewsItem[]> => {
    let firebaseResults: NewsItem[] = [];
    let firebaseSuccess = false;

    // Try Firebase
    if (isFirebaseInitialized && db) {
      try {
        const q = query(collection(db, NEWS_COLLECTION), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firebaseResults.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            date: data.date,
            category: data.category,
            imageUrl: data.imageUrl,
            timestamp: data.timestamp
          });
        });
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase news read failed (using LocalStorage fallback). Error:", e);
      }
    }

    if (firebaseSuccess) return firebaseResults;

    // Local Storage Fallback
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (e) {
      return [];
    }
  },

  getNewsById: async (id: string): Promise<NewsItem | null> => {
    // Try Firebase
    if (isFirebaseInitialized && db && !id.startsWith('local-')) {
      try {
        const docRef = doc(db, NEWS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title,
            content: data.content,
            date: data.date,
            category: data.category,
            imageUrl: data.imageUrl,
            timestamp: data.timestamp
          };
        }
      } catch (e) {
        console.warn("Firebase news read by id failed. Error:", e);
      }
    }

    // Local Storage Fallback
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
      const newsList: NewsItem[] = existingData ? JSON.parse(existingData) : [];
      const found = newsList.find(n => n.id === id);
      return found || null;
    } catch (e) {
      return null;
    }
  },

  saveNews: async (news: NewsItem): Promise<boolean> => {
    const newsData = {
        ...news,
        timestamp: Timestamp.now()
    };

    // Try Firebase
    let firebaseSuccess = false;
    if (isFirebaseInitialized && db) {
      try {
        if (news.id && !news.id.startsWith('local-')) {
            // Update
            const docRef = doc(db, NEWS_COLLECTION, news.id);
            await setDoc(docRef, newsData, { merge: true });
        } else {
            // Create New
            // If it was a local ID, remove it so Firebase generates a new one
            const { id, ...dataToSave } = newsData; 
            await addDoc(collection(db, NEWS_COLLECTION), dataToSave);
        }
        firebaseSuccess = true;
        console.log("News saved to Firebase");
      } catch (e) {
        console.warn("Firebase save news failed (using LocalStorage fallback). Error:", e);
      }
    }

    // Local Storage Sync
    try {
        const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
        let newsList: NewsItem[] = existingData ? JSON.parse(existingData) : [];
        
        if (news.id) {
            // Update existing in local
            const idx = newsList.findIndex(n => n.id === news.id);
            if (idx >= 0) {
                newsList[idx] = { ...newsData, id: news.id }; // Keep ID
            } else {
                newsList.unshift({ ...newsData, id: news.id });
            }
        } else {
            // Create new local
            const newLocalItem = { ...newsData, id: 'local-' + Date.now() };
            newsList.unshift(newLocalItem);
        }
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(newsList));
        return true;
    } catch (e) {
        console.error("Local storage news save failed:", e);
        return firebaseSuccess;
    }
  },

  deleteNews: async (id: string): Promise<boolean> => {
      // Try Firebase
      if (isFirebaseInitialized && db) {
          try {
              await deleteDoc(doc(db, NEWS_COLLECTION, id));
          } catch(e) {
              console.warn("Firebase delete failed:", e);
          }
      }

      // Local Storage
      try {
          const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
          if (existingData) {
              let newsList: NewsItem[] = JSON.parse(existingData);
              newsList = newsList.filter(n => n.id !== id);
              localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(newsList));
          }
          return true;
      } catch(e) {
          return false;
      }
  },

  clearDatabase: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_REGISTRANTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PRINCIPAL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_NEWS_KEY);
    console.log("Local database cleared.");
  }
};