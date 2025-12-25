import { GEMINI_FLASH_MODEL } from '../../../constants';
import { getGeminiClient } from '../gemini';
import { proxyFetch } from '../../core/api';
import { ImageOptions, ImageResult } from './types';
import { isClientSideFallbackAllowed, validateModelCapability } from './utils';

export const analyzeImageInternal = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    options?: ImageOptions
): Promise<ImageResult> => {
    const modelId = options?.model || GEMINI_FLASH_MODEL;

    // 1. Validate Capability
    const validation = validateModelCapability(modelId, 'analyze');
    if (!validation.valid) {
        return { type: 'error', code: 'INVALID_MODEL', message: validation.error || 'Modelo não suporta análise' };
    }

    // 2. Try Backend Proxy
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: modelId,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType } },
                        { text: prompt }
                    ]
                }
            ],
        });

        const text = response.response?.text;
        if (text) {
            return { type: 'text', text };
        }
    } catch (error) {
        console.warn("Backend proxy failed for analyzeImage, checking fallback policy.", error);
    }

    // 3. Fallback to Client-Side (Dev Only)
    if (!isClientSideFallbackAllowed()) {
        return {
            type: 'error',
            code: 'CLIENT_SIDE_DISABLED',
            message: 'Análise client-side desabilitada em produção.'
        };
    }

    try {
        const client = await getGeminiClient(undefined, options?.userId);
        const result = await client.models.generateContent({
            model: modelId,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType } } as any,
                        { text: prompt }
                    ]
                }
            ]
        });

        // Use standard response text getter if available, or navigate the structure
        const responseText = result.text || (result as any).candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
            return { type: 'text', text: responseText };
        }

        return { type: 'error', code: 'GENERATION_FAILED', message: 'Nenhum texto de análise retornado pelo SDK.' };
    } catch (innerError: any) {
        console.error("Analyze image SDK fallback failed:", innerError);
        return {
            type: 'error',
            code: 'GENERATION_FAILED',
            message: innerError.message || 'Falha na análise client-side'
        };
    }
};
