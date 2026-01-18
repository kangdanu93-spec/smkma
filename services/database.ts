import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { PrincipalData, NewsItem, MajorItem } from '../types';

export interface Registrant {
  id: string;
  // Basic Info
  name: string;
  gender: 'L' | 'P';
  major: string;
  uniformSize: string;
  
  // Section A: Personal Data
  nisn: string;
  nik: string;
  kk: string;
  birthPlace: string;
  birthDate: string;
  aktaNo: string;
  religion: string;
  citizenship: string; // WNI or WNA
  country?: string; // If WNA
  specialNeeds: string[]; // Array of codes (A, B, C...)

  // Section B: Address
  address: string;
  rt: string;
  rw: string;
  dusun: string;
  kelurahan: string;
  kecamatan: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  residenceType: string;
  transportMode: string;

  // Additional Data
  childOrder: string;
  hasKIP: string; // 'Ya' | 'Tidak'

  // Section: Father's Data
  fatherName: string;
  fatherNik: string;
  fatherBirthYear: string;
  fatherEducation: string;
  fatherJob: string;
  fatherIncome: string;
  fatherSpecialNeeds: string[];

  // Section: Mother's Data
  motherName: string;
  motherNik: string;
  motherBirthYear: string;
  motherEducation: string;
  motherJob: string;
  motherIncome: string;
  motherSpecialNeeds: string[];

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
const MAJORS_COLLECTION = 'school_majors';
const PRINCIPAL_DOC_ID = 'principal_data';
const HERO_DOC_ID = 'hero_images';

const LOCAL_STORAGE_REGISTRANTS_KEY = 'ppdb_registrants_local';
const LOCAL_STORAGE_PRINCIPAL_KEY = 'principal_data_local';
const LOCAL_STORAGE_NEWS_KEY = 'school_news_local';
const LOCAL_STORAGE_MAJORS_KEY = 'school_majors_data_v5'; 
const LOCAL_STORAGE_HERO_KEY = 'hero_images_local';

export const databaseService = {
  // --- PPDB ---
  saveRegistrant: async (data: Omit<Registrant, 'id' | 'timestamp'>): Promise<boolean> => {
    if (isFirebaseInitialized && db) {
      try {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...data,
          timestamp: Timestamp.now()
        });
        return true;
      } catch (e) {
        console.warn("Firebase write failed:", e);
      }
    }
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_REGISTRANTS_KEY);
      const registrants: Registrant[] = existingData ? JSON.parse(existingData) : [];
      const newRegistrant: Registrant = {
        id: 'local-' + Date.now(),
        ...data,
        timestamp: new Date().toISOString()
      };
      registrants.unshift(newRegistrant);
      localStorage.setItem(LOCAL_STORAGE_REGISTRANTS_KEY, JSON.stringify(registrants));
      return true;
    } catch (e) {
      return false;
    }
  },

  getRegistrants: async (): Promise<Registrant[]> => {
    let firebaseResults: Registrant[] = [];
    let firebaseSuccess = false;

    if (isFirebaseInitialized && db) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Map Firestore data to Registrant Interface safely
          firebaseResults.push({
            id: docSnap.id,
            name: data.name || '',
            gender: data.gender || 'L',
            major: data.major || '',
            uniformSize: data.uniformSize || '',
            nisn: data.nisn || '',
            nik: data.nik || '',
            kk: data.kk || '',
            birthPlace: data.birthPlace || '',
            birthDate: data.birthDate || '',
            aktaNo: data.aktaNo || '',
            religion: data.religion || '',
            citizenship: data.citizenship || 'WNI',
            country: data.country || '',
            specialNeeds: data.specialNeeds || [],
            address: data.address || '',
            rt: data.rt || '',
            rw: data.rw || '',
            dusun: data.dusun || '',
            kelurahan: data.kelurahan || '',
            kecamatan: data.kecamatan || '',
            postalCode: data.postalCode || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            residenceType: data.residenceType || '',
            transportMode: data.transportMode || '',
            childOrder: data.childOrder || '',
            hasKIP: data.hasKIP || 'Tidak',
            // Father Data
            fatherName: data.fatherName || '',
            fatherNik: data.fatherNik || '',
            fatherBirthYear: data.fatherBirthYear || '',
            fatherEducation: data.fatherEducation || '',
            fatherJob: data.fatherJob || '',
            fatherIncome: data.fatherIncome || '',
            fatherSpecialNeeds: data.fatherSpecialNeeds || [],
            // Mother Data
            motherName: data.motherName || '',
            motherNik: data.motherNik || '',
            motherBirthYear: data.motherBirthYear || '',
            motherEducation: data.motherEducation || '',
            motherJob: data.motherJob || '',
            motherIncome: data.motherIncome || '',
            motherSpecialNeeds: data.motherSpecialNeeds || [],
            
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
          });
        });
        firebaseSuccess = true;
      } catch (e) {
        console.warn("Firebase read failed:", e);
      }
    }

    if (firebaseSuccess) return firebaseResults;

    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_REGISTRANTS_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (e) {
      return [];
    }
  },

  // --- KEPALA SEKOLAH ---
  getPrincipalData: async (): Promise<PrincipalData | null> => {
    if (isFirebaseInitialized && db) {
      try {
        const docRef = doc(db, CONFIG_COLLECTION, PRINCIPAL_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as PrincipalData;
        }
      } catch (e) {}
    }
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_PRINCIPAL_KEY);
      if (localData) return JSON.parse(localData) as PrincipalData;
    } catch (e) {}
    return null;
  },

  updatePrincipalData: async (data: PrincipalData): Promise<boolean> => {
    let firebaseSuccess = false;
    if (isFirebaseInitialized && db) {
      try {
        await setDoc(doc(db, CONFIG_COLLECTION, PRINCIPAL_DOC_ID), data);
        firebaseSuccess = true;
      } catch (e) {}
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_PRINCIPAL_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return firebaseSuccess;
    }
  },

  // --- HERO IMAGES / BANNER ---
  getHeroImages: async (): Promise<string[]> => {
      if (isFirebaseInitialized && db) {
          try {
              const docRef = doc(db, CONFIG_COLLECTION, HERO_DOC_ID);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists() && docSnap.data().images) {
                  return docSnap.data().images as string[];
              }
          } catch (e) {}
      }
      try {
          const localData = localStorage.getItem(LOCAL_STORAGE_HERO_KEY);
          if (localData) return JSON.parse(localData);
      } catch (e) {}
      
      // Defaults if nothing found (Optimized Sizes)
      return [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=75&w=1200&auto=format&fit=crop"
      ];
  },

  updateHeroImages: async (images: string[]): Promise<boolean> => {
      let firebaseSuccess = false;
      if (isFirebaseInitialized && db) {
          try {
              await setDoc(doc(db, CONFIG_COLLECTION, HERO_DOC_ID), { images });
              firebaseSuccess = true;
          } catch (e) {}
      }
      try {
          localStorage.setItem(LOCAL_STORAGE_HERO_KEY, JSON.stringify(images));
          return true;
      } catch (e) {
          return firebaseSuccess;
      }
  },

  // --- BERITA / NEWS ---
  getNews: async (): Promise<NewsItem[]> => {
    let firebaseResults: NewsItem[] = [];
    let firebaseSuccess = false;

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
      } catch (e) {}
    }

    if (firebaseSuccess) return firebaseResults;

    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (e) {
      return [];
    }
  },

  getNewsById: async (id: string): Promise<NewsItem | null> => {
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
      } catch (e) {}
    }
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
    const newsData = { ...news, timestamp: Timestamp.now() };
    let firebaseSuccess = false;

    if (isFirebaseInitialized && db) {
      try {
        if (news.id && !news.id.startsWith('local-')) {
            const docRef = doc(db, NEWS_COLLECTION, news.id);
            await setDoc(docRef, newsData, { merge: true });
        } else {
            const { id, ...dataToSave } = newsData; 
            await addDoc(collection(db, NEWS_COLLECTION), dataToSave);
        }
        firebaseSuccess = true;
      } catch (e) {}
    }

    try {
        const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
        let newsList: NewsItem[] = existingData ? JSON.parse(existingData) : [];
        if (news.id) {
            const idx = newsList.findIndex(n => n.id === news.id);
            if (idx >= 0) newsList[idx] = { ...newsData, id: news.id };
            else newsList.unshift({ ...newsData, id: news.id });
        } else {
            newsList.unshift({ ...newsData, id: 'local-' + Date.now() });
        }
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(newsList));
        return true;
    } catch (e) {
        return firebaseSuccess;
    }
  },

  deleteNews: async (id: string): Promise<boolean> => {
      if (isFirebaseInitialized && db) {
          try { await deleteDoc(doc(db, NEWS_COLLECTION, id)); } catch(e) {}
      }
      try {
          const existingData = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
          if (existingData) {
              let newsList: NewsItem[] = JSON.parse(existingData);
              newsList = newsList.filter(n => n.id !== id);
              localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(newsList));
          }
          return true;
      } catch(e) { return false; }
  },

  // --- MAJORS / JURUSAN ---
  getMajors: async (): Promise<MajorItem[]> => {
    let firebaseResults: MajorItem[] = [];
    let firebaseSuccess = false;

    if (isFirebaseInitialized && db) {
      try {
        const q = query(collection(db, MAJORS_COLLECTION), orderBy('code', 'asc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firebaseResults.push({
            id: doc.id,
            code: data.code,
            name: data.name,
            description: data.description,
            logoUrl: data.logoUrl,
            colorTheme: data.colorTheme,
            skills: data.skills,
            careers: data.careers,
            timestamp: data.timestamp
          });
        });
        firebaseSuccess = true;
      } catch (e) {
         console.warn("Firebase major read failed:", e);
      }
    }

    if (firebaseSuccess && firebaseResults.length > 0) return firebaseResults;

    // Local Storage or Default
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_MAJORS_KEY);
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        return parsedData;
      } else {
        // Return Default Data (3 Majors: DKV, TKR, MPLB)
        const defaults: MajorItem[] = [
          {
            id: 'default-1',
            code: 'DKV',
            name: 'Desain Komunikasi Visual',
            description: 'Mempelajari seni desain grafis, ilustrasi, fotografi, videografi, dan multimedia untuk industri kreatif.',
            logoUrl: '',
            colorTheme: 'orange',
            skills: ["Desain Grafis", "Fotografi", "Videografi", "Animasi 2D/3D"],
            careers: ["Graphic Designer", "Video Editor", "Photographer", "Content Creator"]
          },
          {
            id: 'default-2',
            code: 'TKR',
            name: 'Teknik Kendaraan Ringan',
            description: 'Mempelajari perawatan, perbaikan mesin, sistem pemindah tenaga, dan kelistrikan otomotif mobil.',
            logoUrl: '',
            colorTheme: 'blue',
            skills: ["Service Mesin", "Tune Up", "Overhaul", "Kelistrikan Body"],
            careers: ["Mekanik Mobil", "Service Advisor", "Teknisi Otomotif"]
          },
          {
            id: 'default-3',
            code: 'MPLB',
            name: 'Manajemen Perkantoran',
            description: 'Mempelajari administrasi perkantoran modern, kearsipan digital, komunikasi bisnis, dan pelayanan prima.',
            logoUrl: '',
            colorTheme: 'purple',
            skills: ["Arsip Digital", "Korespondensi", "Public Speaking", "Ms Office"],
            careers: ["Staff Admin", "Sekretaris", "Resepsionis", "Customer Service"]
          }
        ];
        localStorage.setItem(LOCAL_STORAGE_MAJORS_KEY, JSON.stringify(defaults));
        return defaults;
      }
    } catch (e) {
      return [];
    }
  },

  saveMajor: async (major: MajorItem): Promise<boolean> => {
    const majorData = { ...major, timestamp: Timestamp.now() };
    let firebaseSuccess = false;

    if (isFirebaseInitialized && db) {
      try {
        if (major.id && !major.id.startsWith('default-') && !major.id.startsWith('local-')) {
          const docRef = doc(db, MAJORS_COLLECTION, major.id);
          await setDoc(docRef, majorData, { merge: true });
        } else {
          const { id, ...dataToSave } = majorData;
          await addDoc(collection(db, MAJORS_COLLECTION), dataToSave);
        }
        firebaseSuccess = true;
      } catch (e) {}
    }

    try {
        const existingData = localStorage.getItem(LOCAL_STORAGE_MAJORS_KEY);
        let list: MajorItem[] = existingData ? JSON.parse(existingData) : [];
        if (major.id) {
            const idx = list.findIndex(m => m.id === major.id);
            if (idx >= 0) list[idx] = { ...majorData, id: major.id };
            else list.push({ ...majorData, id: major.id });
        } else {
            list.push({ ...majorData, id: 'local-' + Date.now() });
        }
        localStorage.setItem(LOCAL_STORAGE_MAJORS_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        return firebaseSuccess;
    }
  },

  deleteMajor: async (id: string): Promise<boolean> => {
     if (isFirebaseInitialized && db) {
        try { await deleteDoc(doc(db, MAJORS_COLLECTION, id)); } catch(e) {}
     }
     try {
        const existingData = localStorage.getItem(LOCAL_STORAGE_MAJORS_KEY);
        if (existingData) {
            let list: MajorItem[] = JSON.parse(existingData);
            list = list.filter(m => m.id !== id);
            localStorage.setItem(LOCAL_STORAGE_MAJORS_KEY, JSON.stringify(list));
        }
        return true;
     } catch(e) { return false; }
  },

  clearDatabase: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_REGISTRANTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PRINCIPAL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_NEWS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_MAJORS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_HERO_KEY);
    console.log("Local database cleared.");
  }
};