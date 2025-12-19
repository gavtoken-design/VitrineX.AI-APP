import { GEMINI_TTS_MODEL } from '../../constants';
import { getGeminiClient } from './gemini';
import { proxyFetch } from '../core/api';

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | undefined> => {
    try {
        const client = await getGeminiClient();

        // STEP 1: Text Normalization (Gemini 3 Flash)
        // Objective: Create a clean script for narration.
        let narrationText = text;
        try {
            const textResponse = await client.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    {
                        role: 'system',
                        parts: [{ text: 'Você é um especialista em redação para áudio. Sua tarefa é reescrever e adaptar o texto fornecido para que ele soe natural e fluido quando narrado em português brasileiro. Remova formatações visuais (markdown, listas com bolinhas), converte números extensos para texto quando apropriado para leitura, e melhore a pontuação para pausas de respiração. O resultado final deve ser APENAS o texto pronto para ser lido.' }]
                    },
                    {
                        role: 'user',
                        parts: [{ text }]
                    }
                ],
                config: {
                    temperature: 0.2 // Low temperature for consistent formatting
                }
            });
            narrationText = textResponse.text;
            console.log("Audio Script Generated:", narrationText);
        } catch (textError) {
            console.warn("Text normalization failed, proceeding with original text:", textError);
        }

        // STEP 2: Audio Generation (Gemini 2.5 Flash Native Audio)
        const audioResponse = await client.models.generateContent({
            model: GEMINI_TTS_MODEL, // Centralized constant for version control
            contents: [
                {
                    role: 'user',
                    parts: [{ text: narrationText }]
                }
            ],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } // Usa a voz passada como parâmetro (padrão: 'Kore')
                }
            }
        });

        // Robust audio data extraction
        const audioPart = audioResponse.candidates?.[0]?.content?.parts?.find(
            (p: any) => p.inlineData?.mimeType?.startsWith('audio/')
        );

        if (audioPart?.inlineData?.data) {
            return audioPart.inlineData.data;
        }

        console.warn("No audio part found in response:", audioResponse);
        return undefined;



    } catch (error) {
        console.error("Audio generation pipeline failed:", error);
        throw error;
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


export function createBlob(data: Float32Array): any {
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
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    return bufferToWav(audioBuffer);
}
