import { GEMINI_IMAGE_MODEL } from '../../../constants';
import { getGeminiClient } from '../gemini';
import { proxyFetch } from '../../core/api';
import { ImageOptions, ImageResult } from './types';
import { isClientSideFallbackAllowed, validateModelCapability, ImageModuleError } from './utils';

export const generateImageInternal = async (prompt: string, options?: ImageOptions): Promise<ImageResult> => {
    const modelId = options?.model || GEMINI_IMAGE_MODEL;

    // 1. Validate Capability
    const validation = validateModelCapability(modelId, 'generate');
    if (!validation.valid) {
        return { type: 'error', code: 'INVALID_MODEL', message: validation.error || 'Modelo inválido' };
    }

    // 2. Try Backend Proxy (Preferred)
    try {
        const response = await proxyFetch<any>('generate-image', 'POST', {
            prompt,
            model: modelId,
            config: {
                aspectRatio: options?.aspectRatio,
                numberOfImages: options?.numberOfImages || 1,
            }
        });

        if (response && response.base64Image) {
            return {
                type: 'image',
                imageUrl: `data:${response.mimeType || 'image/png'};base64,${response.base64Image}`,
                mimeType: response.mimeType,
                base64: response.base64Image
            };
        }
    } catch (error) {
        console.warn("Backend proxy failed for generateImage, checking fallback policy.", error);
    }

    // 3. Fallback to Client-Side (Dev Only)
    if (!isClientSideFallbackAllowed()) {
        return {
            type: 'error',
            code: 'CLIENT_SIDE_DISABLED',
            message: 'Geração client-side desabilitada em produção. O proxy falhou.'
        };
    }

    try {
        const client = await getGeminiClient(undefined, options?.userId);
        const result = await client.models.generateImages({
            model: modelId,
            prompt,
            config: {
                aspectRatio: options?.aspectRatio,
                numberOfImages: options?.numberOfImages || 1,
            }
        });

        if (result.generatedImages && result.generatedImages.length > 0) {
            const img = result.generatedImages[0];
            const base64 = (img.image as any)?.base64;
            if (base64) {
                return {
                    type: 'image',
                    imageUrl: `data:${img.image?.mimeType || 'image/png'};base64,${base64}`,
                    mimeType: img.image?.mimeType,
                    base64: base64
                };
            }
        }

        return { type: 'error', code: 'GENERATION_FAILED', message: 'Nenhuma imagem retornada pelo SDK.' };
    } catch (innerError: any) {
        console.warn("Image generation SDK failed, attempting Pollinations.ai fallback:", innerError);

        // 4. Fallback to Pollinations.ai (Free/No-Key)
        try {
            const encodedPrompt = encodeURIComponent(prompt);
            // Add seed to ensure consistency if needed, or random param
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;

            const fallbackResponse = await fetch(pollinationsUrl);
            if (!fallbackResponse.ok) {
                throw new Error(`Pollinations API failed with status ${fallbackResponse.status}`);
            }

            const arrayBuffer = await fallbackResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const mimeType = 'image/jpeg'; // Pollinations usually returns JPEG

            return {
                type: 'image',
                imageUrl: `data:${mimeType};base64,${base64}`,
                mimeType: mimeType,
                base64: base64
            };
        } catch (fallbackError: any) {
            console.error("All image generation methods failed.", fallbackError);
            return {
                type: 'error',
                code: 'GENERATION_FAILED',
                message: innerError.message || 'Falha na geração (SDK e Fallback)'
            };
        }
    }
};
