import { IMAGE_MODEL_CAPS, ImageErrorCode } from './types';

export const isProduction = () => {
    // Check for VITE_USER_NODE_ENV or standard import.meta.env.PROD
    return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

export const isClientSideFallbackAllowed = (): boolean => {
    if (isProduction()) {
        return false;
    }
    // Allow fallback in dev unless explicitly disabled
    return true;
};

export const validateModelCapability = (modelId: string, capability: 'generate' | 'edit' | 'analyze'): { valid: boolean; error?: string } => {
    const caps = IMAGE_MODEL_CAPS[modelId];
    if (!caps) {
        return { valid: false, error: `Modelo desconhecido: ${modelId}` };
    }

    if (capability === 'generate' && !caps.canGenerate) {
        return { valid: false, error: `Modelo ${modelId} não suporta geração de imagens nativa.` };
    }
    if (capability === 'edit' && !caps.canEdit) {
        return { valid: false, error: `Modelo ${modelId} não suporta edição de imagens.` };
    }
    if (capability === 'analyze' && !caps.canAnalyze) {
        return { valid: false, error: `Modelo ${modelId} não suporta análise de imagens.` };
    }

    return { valid: true };
};

export class ImageModuleError extends Error {
    constructor(public message: string, public code: ImageErrorCode) {
        super(message);
        this.name = 'ImageModuleError';
    }
}
