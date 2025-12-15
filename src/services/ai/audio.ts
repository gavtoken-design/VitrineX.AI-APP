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

export function bufferToWav(buffer: AudioBuffer): globalThis.Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(36 + buffer.length * 2 * numOfChan);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(buffer.length * 2 * numOfChan);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numOfChan; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return new globalThis.Blob([view], { type: 'audio/wav' });
}

export async function base64AudioToWavBlob(base64: string): Promise<globalThis.Blob> {
    const audioBytes = decode(base64);
    // Use a standard sample rate, or detect/parameterize if needed. Gemini usually 24000Hz.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    return bufferToWav(audioBuffer);
}
