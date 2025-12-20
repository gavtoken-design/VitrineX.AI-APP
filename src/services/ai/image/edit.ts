import { GEMINI_FLASH_MODEL } from '../../../constants';
import { getGeminiClient } from '../gemini';
import { proxyFetch } from '../../core/api';
import { ImageOptions, ImageResult } from './types';
import { isClientSideFallbackAllowed, validateModelCapability } from './utils';

export const editImageInternal = async (
    prompt: string,
    base64ImageData: string,
    mimeType: string,
    options?: ImageOptions
): Promise<ImageResult> => {
    // Standard edit model is usually Flash (multimodal) or specific Vision models
    const modelId = options?.model || GEMINI_FLASH_MODEL;

    // 1. Validate Capability
    const validation = validateModelCapability(modelId, 'edit');
    if (!validation.valid) {
        return { type: 'error', code: 'INVALID_MODEL', message: validation.error || 'Modelo não suporta edição' };
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

        const imagePart = response.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart) {
            return {
                type: 'image',
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                mimeType: imagePart.inlineData.mimeType,
                base64: imagePart.inlineData.data
            };
        }

        const textResponse = response.response?.text;
        if (textResponse) {
            return { type: 'text', text: textResponse };
        }
    } catch (error) {
        console.warn("Backend proxy failed for editImage, checking fallback policy.", error);
    }

    // 3. Fallback to Client-Side (Dev Only)
    if (!isClientSideFallbackAllowed()) {
        return {
            type: 'error',
            code: 'CLIENT_SIDE_DISABLED',
            message: 'Edição client-side desabilitada em produção.'
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

        const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                type: 'image',
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                mimeType: imagePart.inlineData.mimeType,
                base64: imagePart.inlineData.data
            };
        }

        if (result.text) {
            return { type: 'text', text: result.text };
        }

        return { type: 'error', code: 'GENERATION_FAILED', message: 'Nenhuma edição retornada pelo SDK.' };
    } catch (innerError: any) {
        console.error("Edit image SDK fallback failed:", innerError);
        return {
            type: 'error',
            code: 'GENERATION_FAILED',
            message: innerError.message || 'Falha na edição client-side'
        };
    }
};
