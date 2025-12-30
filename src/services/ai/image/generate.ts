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
                negativePrompt: options?.negativePrompt,
            },
            signal: options?.signal
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
    // We try client-side SDK if allowed. If not allowed, we skip directly to Pollinations.
    if (isClientSideFallbackAllowed()) {
        try {
            const client = await getGeminiClient(undefined, options?.userId);
            let base64: string | undefined;
            let mimeType: string | undefined;

            // TRACK 1: Imagen Models (using generateImages as per Imagen 4 docs)
            if (modelId.includes('imagen')) {
                const result = await client.models.generateImages({
                    model: modelId,
                    prompt,
                    config: {
                        aspectRatio: options?.aspectRatio,
                        numberOfImages: options?.numberOfImages || 1,
                        negativePrompt: options?.negativePrompt,
                    }
                });

                if (result.generatedImages && result.generatedImages.length > 0) {
                    const firstImg = result.generatedImages[0].image;
                    base64 = firstImg.imageBytes; // docs show imageBytes for binary
                    mimeType = firstImg.mimeType || 'image/png';
                }
            }
            // TRACK 2: Gemini Built-in Image (using generateContent as per Gemini 2.5 docs)
            else {
                const result = await client.models.generateContent({
                    model: modelId,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                });

                const candidates = (result as any).candidates;
                if (candidates && candidates.length > 0) {
                    const imagePart = candidates[0].content?.parts?.find((p: any) => p.inlineData);
                    if (imagePart?.inlineData) {
                        base64 = imagePart.inlineData.data;
                        mimeType = imagePart.inlineData.mimeType;
                    }
                }
            }

            if (base64) {
                return {
                    type: 'image',
                    imageUrl: `data:${mimeType || 'image/png'};base64,${base64}`,
                    mimeType: mimeType,
                    base64: base64
                };
            }
            console.warn("SDK returned no images, proceeding to fallback.");
        } catch (innerError: any) {
            console.warn("Image generation SDK fallback failed, proceeding to Pollinations:", innerError);
        }
    } else {
        console.warn("Client-side SDK disabled, skipping to Pollinations fallback.");
    }

    // 4. Fallback to Pollinations.ai (Free/No-Key/Production Safe)
    try {
        const encodedPrompt = encodeURIComponent(prompt);
        // Add seed to ensure consistency if needed, or random param
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;

        console.log("Attempting Pollinations fallback:", pollinationsUrl);
        const fallbackResponse = await fetch(pollinationsUrl);
        if (!fallbackResponse.ok) {
            throw new Error(`Pollinations API failed with status ${fallbackResponse.status}`);
        }

        const blob = await fallbackResponse.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // result format: "data:image/jpeg;base64,..."
                const base64Part = result.split(',')[1];
                resolve(base64Part);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

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
            message: 'Falha na geração de imagem (Todos os métodos falharam).'
        };
    }
};
