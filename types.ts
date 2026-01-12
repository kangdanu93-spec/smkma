
export enum PortalMode {
  HOME = 'HOME',
  MAPS = 'MAPS',
  LIVE = 'LIVE',
  THINK = 'THINK',
  PROFILE = 'PROFILE',
  MAJORS = 'MAJORS',
  BKK = 'BKK',
  PPDB = 'PPDB',
  UKOM = 'UKOM',
  ADMIN = 'ADMIN',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
      }[];
    }[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingChunks?: GroundingChunk[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface PrincipalData {
  name: string;
  title: string;
  message: string;
  photoUrl: string;
  schoolLogoUrl?: string; // New field for School Logo
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string; // 'NEWS', 'EVENT', 'PRESTASI'
  imageUrl: string;
  timestamp?: any;
}

export interface MajorItem {
  id: string;
  code: string; // e.g. DKV, TKR
  name: string;
  description: string;
  logoUrl: string; // Custom uploaded logo
  colorTheme: 'orange' | 'blue' | 'purple' | 'emerald' | 'rose' | 'slate';
  skills: string[]; // Stored as array, edited as comma-separated string
  careers: string[];
  timestamp?: any;
}