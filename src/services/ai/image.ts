import {
    IMAGEN_STANDARD_MODEL,
    IMAGEN_ULTRA_MODEL,
    GEMINI_IMAGE_MODEL,
    GEMINI_FLASH_MODEL,
} from '../../constants';
import { getGeminiClient } from './gemini';
import { proxyFetch } from '../core/api';

export interface GenerateImageOptions {
    model?: string;
    aspectRatio?: string;
    imageSize?: string;
    tools?: any[];
}

export const generateImage = async (prompt: string, options?: GenerateImageOptions): Promise<{ imageUrl?: string; text?: string }> => {
    const modelId = options?.model || GEMINI_IMAGE_MODEL;

    // Image generation config for Imagen 3 via Gemini API
    // Note: The new SDK supports 'mediaResolution' or 'aspectRatio' in config depending on model version
    // Checking standard usage for Gemini 3 Image models.
    const imageConfig: any = {
        aspectRatio: options?.aspectRatio,
    };

    if (modelId === IMAGEN_ULTRA_MODEL && options?.imageSize) {
        // imageConfig.imageSize = options.imageSize; // If supported by API
    }

    // For Imagen 3, typical config is usually separate or part of generationConfig
    // Assuming standard GenerateContentConfig style for now

    try {
        const response = await proxyFetch<any>('generate-image', 'POST', {
            prompt,
            model: modelId,
            imageConfig,
            options: {},
        });
        return { imageUrl: `data:${response.mimeType};base64,${response.base64Image}` };
    } catch (error) {
        console.warn("Backend proxy failed for generateImage, falling back to client-side SDK.", error);

        try {
            const client = await getGeminiClient();

            // Using specify Imagen 3 method generateImages
            const result = await client.models.generateImages({
                model: modelId,
                prompt,
                config: {
                    aspectRatio: options?.aspectRatio,
                    numberOfImages: 1,
                }
            });

            if (result.generatedImages && result.generatedImages.length > 0) {
                const img = result.generatedImages[0];
                // SDK v1 uses 'image' object with 'mimeType' and 'base64'
                return { imageUrl: `data:${img.image?.mimeType};base64,${(img.image as any)?.base64}` };
            }

            return { text: 'Imagem gerada, mas formato não reconhecido no fallback.' };
        } catch (innerError) {
            console.error("Image generation SDK fallback failed:", innerError);
            throw innerError;
        }
    }
};

export const editImage = async (prompt: string, base64ImageData: string, mimeType: string, modelId: string = GEMINI_IMAGE_MODEL): Promise<{ imageUrl?: string; text?: string }> => {
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: modelId,
            contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
        });
        const imagePart = response.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart) {
            return { imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` };
        }
        return { text: response.response?.text || 'Nenhuma edição retornada.' };
    } catch (error) {
        console.warn("Backend proxy failed for editImage, falling back to client-side SDK.", error);
        try {
            const client = await getGeminiClient();
            // In SDK v1, editImage uses 'source' for the image
            const result = await client.models.editImage({
                model: modelId,
                prompt,
                source: {
                    base64: base64ImageData,
                    mimeType
                } as any
            });

            if (result.generatedImages && result.generatedImages.length > 0) {
                const img = result.generatedImages[0];
                return { imageUrl: `data:${img.image?.mimeType};base64,${(img.image as any)?.base64}` };
            }
            return { text: 'Nenhuma edição retornada no fallback.' };
        } catch (innerError) {
            console.error("Edit image SDK fallback failed:", innerError);
            throw innerError;
        }
    }
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string, modelId: string = GEMINI_FLASH_MODEL): Promise<string> => {
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: modelId,
            contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
        });
        return response.response?.text || 'Sem análise.';
    } catch (error) {
        console.warn("Backend proxy failed for analyzeImage, falling back to client-side SDK.", error);
        try {
            const client = await getGeminiClient();
            const result = await client.models.generateContent({
                model: modelId,
                contents: [
                    {
                        role: 'user', parts: [
                            { inlineData: { data: base64ImageData, mimeType } } as any,
                            { text: prompt }
                        ]
                    }
                ]
            });
            return result.text || 'Análise sem texto.';
        } catch (innerError) {
            console.error("Analyze image SDK fallback failed:", innerError);
            return 'Erro na análise local.';
        }
    }
};
