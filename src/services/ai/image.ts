import {
    GEMINI_IMAGE_FLASH_MODEL,
    GEMINI_IMAGE_PRO_MODEL,
} from '../../constants';
import { getGenAIClient } from './gemini';
import { proxyFetch } from '../core/api';

export interface GenerateImageOptions {
    model?: string;
    aspectRatio?: string;
    imageSize?: string;
    tools?: any[];
}

export const generateImage = async (prompt: string, options?: GenerateImageOptions): Promise<{ imageUrl?: string; text?: string }> => {
    const modelId = options?.model || GEMINI_IMAGE_FLASH_MODEL;

    // Image generation config for Imagen 3 via Gemini API
    // Note: The new SDK supports 'mediaResolution' or 'aspectRatio' in config depending on model version
    // Checking standard usage for Gemini 3 Image models.
    const imageConfig: any = {
        aspectRatio: options?.aspectRatio,
    };

    if (modelId === GEMINI_IMAGE_PRO_MODEL && options?.imageSize) {
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
            const client = await getGenAIClient();

            const result = await client.models.generateContent({
                model: modelId,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    // Pass image generation styling options if model accepts them in generationConfig
                    // For Imagen models, parameters like aspectRatio might be expected.
                    // Using generic config object to pass them.
                    ...imageConfig
                }
            });

            // Inspect candidates for inlineData (image base64)
            if (result.candidates) {
                for (const cand of result.candidates) {
                    if (cand.content?.parts) {
                        for (const part of cand.content.parts) {
                            if (part.inlineData) {
                                return { imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
                            }
                        }
                    }
                }
            }

            return { text: result.text || 'Imagem gerada, mas formato não reconhecido no fallback.' };
        } catch (innerError) {
            console.error("Image generation SDK fallback failed:", innerError);
            throw innerError;
        }
    }
};

export const editImage = async (prompt: string, base64ImageData: string, mimeType: string, modelId: string = GEMINI_IMAGE_FLASH_MODEL): Promise<{ imageUrl?: string; text?: string }> => {
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
            const client = await getGenAIClient();
            const result = await client.models.generateContent({
                model: modelId,
                contents: [
                    {
                        role: 'user', parts: [
                            { inlineData: { data: base64ImageData, mimeType } },
                            { text: prompt }
                        ]
                    }
                ]
            });

            if (result.candidates) {
                for (const cand of result.candidates) {
                    if (cand.content?.parts) {
                        for (const part of cand.content.parts) {
                            if (part.inlineData) {
                                return { imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
                            }
                        }
                    }
                }
            }
            return { text: result.text || 'Nenhuma edição retornada no fallback.' };
        } catch (innerError) {
            console.error("Edit image SDK fallback failed:", innerError);
            throw innerError;
        }
    }
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string, modelId: string = GEMINI_IMAGE_PRO_MODEL): Promise<string> => {
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: modelId,
            contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
        });
        return response.response?.text || 'Sem análise.';
    } catch (error) {
        console.warn("Backend proxy failed for analyzeImage, falling back to client-side SDK.", error);
        try {
            const client = await getGenAIClient();
            const result = await client.models.generateContent({
                model: modelId,
                contents: [
                    {
                        role: 'user', parts: [
                            { inlineData: { data: base64ImageData, mimeType } },
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
