
export interface TranscriptionSegment {
  text: string;
  isFinal: boolean;
}

// Define BusinessProfile interface
export interface BusinessProfile {
  name: string;
  industry: string;
  targetAudience: string;
  visualStyle: string;
}

// Define UserProfile interface
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: Role; // Added role property
  phone?: string; // Added phone property
  plan: 'free' | 'premium' | 'enterprise';
  businessProfile: BusinessProfile;
  contactInfo?: {
    phone?: string;
    address?: string;
    cnpj?: string;
    whatsapp?: string;
    contactEmail?: string; // Public contact email
    website?: string;
    contact?: string; // Generic contact info or link
    instagram?: string; // e.g. @vitrinex
    tiktok?: string;
    twitter?: string;
    pinterest?: string;
    facebook?: string;
    linkedin?: string; // Explicitly kept for completeness, though user doesn't use it
  };
  status?: 'active' | 'blocked'; // Added status for admin control
  apiKey?: string; // Persisted AI license key
  secureConfig?: Record<string, any>; // For future encrypted settings
  avatar?: string; // URL da imagem de perfil
  credits: number; // Saldo de créditos do usuário
}

// Define Post interface
export interface Post {
  id: string;
  userId: string;
  title?: string; // New: Title for the post
  content_text: string;
  image_url?: string;
  image_prompt?: string; // New: editable image prompt
  date?: string;
  createdAt: string; // ISO date string
  tags?: string[];
  hashtags?: string[]; // New: specific hashtags for the post
}

export interface TargetAudience {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
}

// Define Ad interface
export interface Ad {
  id: string;
  userId: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google' | 'Pinterest';
  headline: string;
  copy: string;
  media_url?: string;
  createdAt: string; // ISO date string
}

// Define Campaign interface
export interface Campaign {
  id: string;
  userId: string;
  name: string;
  type: string; // e.g., 'general', 'product_launch'
  description?: string;
  strategy?: string;
  hashtags?: string[];
  posts: Post[];
  ads: Ad[];
  video_url?: string;
  timeline: string;
  createdAt: string; // ISO date string
}

// NOVO: Interface para metadados de grounding
export interface GroundingMetadata {
  groundingChunks: Array<{ web?: { uri: string; title: string }; maps?: { uri: string; title: string } }>;
  groundingSupports: Array<{
    segment: { startIndex: number; endIndex: number; text: string };
    groundingChunkIndices: number[];
  }>;
}

// Define Trend interface
export interface Trend {
  id: string;
  userId: string;
  query: string;
  score: number; // e.g., viral score
  data: string; // summary of the trend
  sources?: Array<{ uri: string; title: string }>;
  groundingMetadata?: GroundingMetadata; // NOVO
  createdAt: string; // ISO date string
}

// Define LibraryItem interface
export interface LibraryItem {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text' | 'post' | 'ad' | 'audio' | 'html' | 'code' | 'prompt'; // Added 'prompt' type
  file_url: string;
  thumbnail_url?: string; // For images/videos
  tags: string[];
  name: string;
  createdAt: string; // ISO date string
}

// Define ScheduleEntry interface
export interface ScheduleEntry {
  id: string;
  userId: string;
  datetime: string; // ISO date string for scheduling
  platform: string; // e.g., 'Instagram', 'Facebook'
  contentId: string; // Reference to LibraryItem ID or Post/Ad ID
  contentType: 'post' | 'ad' | 'audio' | 'video' | 'image' | 'text'; // Added types for content
  content?: string; // Optional: Direct content text
  mediaUrl?: string; // Optional: Direct media URL (or base64)
  status: 'scheduled' | 'published' | 'failed';
}

// Define ChatMessage interface for Chatbot
export interface ChatMessage {
  role: 'user' | 'model' | 'tool';
  text: string;
  timestamp: string; // ISO date string
  toolCall?: {
    name: string;
    args: any;
  };
  attachment?: {
    name: string;
    type: string;
    data: string; // base64
  };
}

// NOVO: Interface para a resposta de consulta RAG do backend
export interface KnowledgeBaseQueryResponse {
  resposta: string;
  arquivos_usados: string[];
  trechos_referenciados: string[];
  confianca: number;
}

// NOVO: DTOs do Backend para comunicação
export interface OrganizationResponseDto {
  id: string;
  name: string;
  fileSearchStoreName?: string; // Opcional, nome da loja File Search associada
}

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER'; // Assumindo enum Role do Prisma

export interface OrganizationMembership {
  organization: OrganizationResponseDto;
  role: Role;
}

export interface LoginResponseDto {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  organizations: OrganizationMembership[];
}

// Admin Interfaces
export interface AdminLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  module: string;
  message: string;
  userId?: string;
}

export interface AdminConfig {
  modules: {
    [key: string]: boolean;
  };
  features: {
    // AI Generation Features
    imageGenerationEnabled: boolean;
    videoGenerationEnabled: boolean;
    audioGenerationEnabled: boolean;
    textGenerationEnabled: boolean;

    // Tools & Utilities
    trendHunterEnabled: boolean;
    chatbotEnabled: boolean;
    creativeStudioEnabled: boolean;
    adStudioEnabled: boolean;
    smartSchedulerEnabled: boolean;

    // Advanced Features
    ragKnowledgeBaseEnabled: boolean;
    voiceInputEnabled: boolean;
    multimodalChatEnabled: boolean;
    brandLogoManagerEnabled: boolean;
  };
  system: {
    maintenanceMode: boolean;
    debugLevel: string;
    globalRateLimit: number;
  };
}

// Extend Window interface for Electron and AI Studio
declare global {
  // FIX: Define AIStudio and IElectronAPI interfaces explicitly inside global scope to avoid module conflicts
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface IElectronAPI {
    saveFile: (imageUrl: string, fileName: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  }

  interface Window {
    electronAPI?: IElectronAPI;
    aistudio?: AIStudio;
  }
}

export interface APIKey {
  id: string;
  label: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}
