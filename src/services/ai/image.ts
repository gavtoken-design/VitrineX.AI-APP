import { Tool } from '@google/genai';
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
    tools?: Tool[];
}

export const generateImage = async (prompt: string, options?: GenerateImageOptions): Promise<{ imageUrl?: string; text?: string }> => {
    const model = options?.model || GEMINI_IMAGE_FLASH_MODEL;

    // FIX: imageSize is ONLY supported by Gemini 3 Pro Image (gemini-3-pro-image-preview).
    // Sending it to Flash Image (gemini-2.5-flash-image) causes INVALID_ARGUMENT (400).
    const imageConfig: any = {
        aspectRatio: options?.aspectRatio,
    };

    if (model === GEMINI_IMAGE_PRO_MODEL && options?.imageSize) {
        imageConfig.imageSize = options.imageSize;
    }

    try {
        const response = await proxyFetch<any>('generate-image', 'POST', {
            prompt,
            model,
            imageConfig,
            options: {},
        });
        return { imageUrl: `data:${response.mimeType};base64,${response.base64Image}` };
    } catch (error) {
        console.warn("Backend proxy failed for generateImage, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig
            } as any
        });

        let imageUrl = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (imageUrl) return { imageUrl };
        return { text: response.text || 'Imagem gerada, mas formato não reconhecido no fallback.' };
    }
};

export const editImage = async (prompt: string, base64ImageData: string, mimeType: string, model: string = GEMINI_IMAGE_FLASH_MODEL): Promise<{ imageUrl?: string; text?: string }> => {
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model,
            contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
        });
        const imagePart = response.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart) {
            return { imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` };
        }
        return { text: response.response?.text || 'Nenhuma edição retornada.' };
    } catch (error) {
        console.warn("Backend proxy failed for editImage, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType } },
                    { text: prompt },
                ],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return { imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
            }
        }
        return { text: response.text || 'Nenhuma edição retornada no fallback.' };
    }
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string, model: string = GEMINI_IMAGE_PRO_MODEL): Promise<string> => {
    // Note: Defaulted to GEMINI_IMAGE_PRO_MODEL just in case, original was GEMINI_PRO_MODEL but for vision usually needs vision model or flash.
    // Original file used GEMINI_PRO_MODEL (which is likely 1.5-pro or similiar).
    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model,
            contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
        });
        return response.response?.text || 'Sem análise.';
    } catch (error) {
        console.warn("Backend proxy failed for analyzeImage, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType } },
                    { text: prompt }
                ]
            }
        });
        return response.text || 'Sem análise no fallback.';
    }
};
