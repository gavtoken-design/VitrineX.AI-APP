import { IMAGEN_STANDARD_MODEL, IMAGEN_ULTRA_MODEL, IMAGEN_FAST_MODEL } from '../../../constants';

export type ImageResult =
    | { type: 'image'; imageUrl: string; mimeType?: string; base64?: string }
    | { type: 'text'; text: string }
    | { type: 'error'; message: string; code?: ImageErrorCode };

export type ImageErrorCode =
    | 'PROXY_FAILED'
    | 'CLIENT_SIDE_DISABLED'
    | 'INVALID_MODEL'
    | 'UNSUPPORTED_CONFIG'
    | 'GENERATION_FAILED';

export interface ImageOptions {
    model?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    numberOfImages?: number;
    safetySetting?: string;
    userId?: string;
    negativePrompt?: string;
}

export interface ModelCapability {
    canGenerate: boolean;
    canEdit: boolean;
    canAnalyze: boolean;
    supportedAspectRatios: string[];
}

export const IMAGE_MODEL_CAPS: Record<string, ModelCapability> = {
    [IMAGEN_ULTRA_MODEL]: {
        canGenerate: true,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    },
    // Standard Model shares the same ID as Ultra currently, so entry is deduplicated
    // [IMAGEN_STANDARD_MODEL]: { ... }
    [IMAGEN_FAST_MODEL]: {
        canGenerate: true,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    },
    'gemini-2.5-flash-image': {
        canGenerate: true,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    },
    'gemini-2.5-flash': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    },
    'gemini-2.5-pro': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    },
    'gemini-3-flash-preview': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    },
    'gemini-2.0-flash-exp': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    },
    'gemini-1.5-flash': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    },
    'gemini-1.5-pro': {
        canGenerate: false,
        canEdit: true,
        canAnalyze: true,
        supportedAspectRatios: [],
    }
};
