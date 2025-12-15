import { VEO_FAST_GENERATE_MODEL } from '../../constants';
// VideoGenerationReferenceImage is from @google/genai, check constants or imports
import { VideoGenerationReferenceImage } from '@google/genai';
import { getGenAIClient } from './gemini';
import { proxyFetch } from '../core/api';

export interface GenerateVideoOptions {
    model?: string;
    image?: { imageBytes: string; mimeType: string };
    lastFrame?: { imageBytes: string; mimeType: string };
    referenceImages?: VideoGenerationReferenceImage[];
    config?: any;
}

export const generateVideo = async (prompt: string, options?: GenerateVideoOptions): Promise<string> => {
    try {
        const response = await proxyFetch<{ videoUri: string }>('generate-video', 'POST', {
            prompt,
            model: options?.model || VEO_FAST_GENERATE_MODEL,
            videoConfig: options?.config,
            ...options,
        });
        return response.videoUri;
    } catch (error) {
        console.warn("Backend proxy failed for generateVideo, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();

        const request: any = {
            model: options?.model || VEO_FAST_GENERATE_MODEL,
            prompt,
            image: options?.image,
            lastFrame: options?.lastFrame,
            config: options?.config
        };

        Object.keys(request).forEach(key => request[key] === undefined && delete request[key]);

        let operation = await ai.models.generateVideos(request);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) throw new Error("Video generated but no URI returned in fallback.");
        return uri;
    }
};
