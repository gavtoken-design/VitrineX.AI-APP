import { Modality, Blob } from '@google/genai';
import { GEMINI_TTS_MODEL } from '../../constants';
import { getGenAIClient } from './gemini';
import { proxyFetch } from '../core/api';

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | undefined> => {
    try {
        const response = await proxyFetch<any>('generate-speech', 'POST', {
            text,
            model: GEMINI_TTS_MODEL,
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        });
        return response.base64Audio;
    } catch (error) {
        console.warn("Backend proxy failed for generateSpeech, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();
        const response = await ai.models.generateContent({
            model: GEMINI_TTS_MODEL,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName } }
                }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }
};

export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
        mimeType: 'audio/pcm;rate=16000',
    };
}
