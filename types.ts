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
}