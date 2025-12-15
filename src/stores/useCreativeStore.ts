
import { create } from 'zustand';
import { Post, Ad } from '../types'; // Assuming types are in '../types'
import { PLACEHOLDER_IMAGE_BASE64 } from '../constants';

// State for ContentGenerator
interface ContentGeneratorState {
  cgPrompt: string;
  generatedPost: Post | null;
  generatedImageUrl: string;
  setCGPrompt: (prompt: string) => void;
  setGeneratedPost: (post: Post | null) => void;
  setGeneratedImageUrl: (url: string) => void;
  resetContentGenerator: () => void;
}

// State for AdStudio
interface AdStudioState {
  adProductDescription: string;
  adTargetAudience: string;
  adSelectedPlatform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google' | 'Pinterest';
  generatedAd: Ad | null;
  generatedAdImageUrl: string;
  setAdProductDescription: (desc: string) => void;
  setAdTargetAudience: (audience: string) => void;
  setAdSelectedPlatform: (platform: AdStudioState['adSelectedPlatform']) => void;
  setGeneratedAd: (ad: Ad | null) => void;
  setGeneratedAdImageUrl: (url: string) => void;
  resetAdStudio: () => void;
}

type CreativeState = ContentGeneratorState & AdStudioState;

export const useCreativeStore = create<CreativeState>((set) => ({
  // ContentGenerator initial state and actions
  cgPrompt: '',
  generatedPost: null,
  generatedImageUrl: PLACEHOLDER_IMAGE_BASE64,
  setCGPrompt: (prompt) => set({ cgPrompt: prompt }),
  setGeneratedPost: (post) => set({ generatedPost: post }),
  setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
  resetContentGenerator: () => set({
    cgPrompt: '',
    generatedPost: null,
    generatedImageUrl: PLACEHOLDER_IMAGE_BASE64,
  }),

  // AdStudio initial state and actions
  adProductDescription: '',
  adTargetAudience: '',
  adSelectedPlatform: 'Instagram',
  generatedAd: null,
  generatedAdImageUrl: PLACEHOLDER_IMAGE_BASE64,
  setAdProductDescription: (desc) => set({ adProductDescription: desc }),
  setAdTargetAudience: (audience) => set({ adTargetAudience: audience }),
  setAdSelectedPlatform: (platform) => set({ adSelectedPlatform: platform }),
  setGeneratedAd: (ad) => set({ generatedAd: ad }),
  setGeneratedAdImageUrl: (url) => set({ generatedAdImageUrl: url }),
  resetAdStudio: () => set({
    adProductDescription: '',
    adTargetAudience: '',
    adSelectedPlatform: 'Instagram',
    generatedAd: null,
    generatedAdImageUrl: PLACEHOLDER_IMAGE_BASE64,
  }),
}));
