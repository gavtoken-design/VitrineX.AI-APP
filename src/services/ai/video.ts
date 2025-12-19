import { VEO_GENERATE_MODEL } from '../../constants';
import { getGeminiClient } from './gemini';
import { proxyFetch } from '../core/api';

export interface GenerateVideoOptions {
    model?: string;
    image?: { imageBytes: string; mimeType: string };
    lastFrame?: { imageBytes: string; mimeType: string };
    referenceImages?: any[];
    config?: any;
}

export const generateVideo = async (prompt: string, options?: GenerateVideoOptions): Promise<string> => {
    const modelId = options?.model || VEO_GENERATE_MODEL;

    try {
        const response = await proxyFetch<{ videoUri: string }>('generate-video', 'POST', {
            prompt,
            model: modelId,
            videoConfig: options?.config,
            ...options,
        });
        return response.videoUri;
    } catch (error) {
        console.warn("Backend proxy failed for generateVideo, falling back to client-side SDK.", error);

        try {
            const client = await getGeminiClient();

            // Note: Direct video generation in the client SDK might need 'generateVideo' method or specific config
            // For now, attempting generic content generation or throwing if not supported client-side
            const result = await client.models.generateContent({
                model: modelId,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    // @ts-ignore
                    videoConfig: options?.config
                }
            });

            // Logic to extract video URI would go here if supported
            // const response = result.response;

            throw new Error("Local video generation not fully supported in this SDK version.");
        } catch (innerError) {
            console.error("Video fallback failed:", innerError);
            throw innerError;
        }
    }
};
