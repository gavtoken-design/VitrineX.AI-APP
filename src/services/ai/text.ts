import {
    Tool,
    Part,
    Content
} from '@google/genai';
import {
    GEMINI_FLASH_MODEL,
    GEMINI_PRO_MODEL,
    GEMINI_THINKING_MODEL,
} from '../../constants';
// We will move types to a central location or keep them in src/types.ts. 
// The implementation plan didn't say we move src/types.ts, so we keep using ../../types
import {
    UserProfile,
    ChatMessage,
    Trend,
    Campaign
} from '../../types';
import { getGenAIClient } from './gemini';
import { proxyFetch } from '../core/api'; // We need to create this shared helper

// Constants from original file
const GEMINI_IMAGE_FLASH_MODEL = 'gemini-2.5-flash-image'; // Re-declaring if not exported, or import from constants

export interface GenerateTextOptions {
    model?: string;
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
    tools?: Tool[];
    thinkingBudget?: number;
    useThinking?: boolean; // New Option
}

export const generateText = async (prompt: string, options?: GenerateTextOptions): Promise<string> => {
    const modelToUse = options?.useThinking ? GEMINI_THINKING_MODEL : (options?.model || GEMINI_FLASH_MODEL);

    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: modelToUse,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: options,
        });
        return response.response?.text || '';
    } catch (error) {
        console.warn("Backend proxy failed for generateText, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();
        const response = await ai.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: options,
        });
        return response.text || '';
    }
};

export const sendMessageToChat = async (
    history: ChatMessage[],
    message: string | (string | Part)[],
    onChunk: (text: string) => void,
    options: { model?: string; systemInstruction?: string; useKnowledgeBase?: boolean; useThinking?: boolean },
    signal?: AbortSignal
): Promise<string> => {
    // Logic copied from original geminiService.ts
    // Needs BACKEND_URL, getActiveOrganizationId, getAuthToken from legacy/core services

    // Determine model
    const model = options.useThinking ? GEMINI_THINKING_MODEL : (options.model || GEMINI_PRO_MODEL);

    const { getAuthToken, getActiveOrganizationId, BACKEND_URL } = await import('../core/auth');

    // Convert message to Parts array format
    const messageParts: Part[] = [];
    if (typeof message === 'string') {
        messageParts.push({ text: message });
    } else {
        // message is (string | Part)[]
        for (const item of message) {
            if (typeof item === 'string') {
                messageParts.push({ text: item });
            } else {
                messageParts.push(item);
            }
        }
    }

    try {
        const organizationId = getActiveOrganizationId();
        const idToken = await getAuthToken();

        const body = {
            prompt: typeof message === 'string' ? message : message.find(p => typeof p === 'string') || '',
            parts: messageParts, // Include full multimodal parts
            history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            model: model,
            options: { systemInstruction: options.systemInstruction },
        };

        const response = await fetch(`${BACKEND_URL}/organizations/${organizationId}/ai-proxy/stream-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify(body),
            signal,
        });

        if (!response.ok || !response.body) throw new Error(`Streaming request failed: ${response.statusText}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (signal?.aborted) { reader.cancel(); break; }
            const chunkStr = decoder.decode(value);
            try {
                const chunkJson = JSON.parse(chunkStr);
                if (chunkJson.text) {
                    fullText += chunkJson.text;
                    onChunk(fullText);
                }
            } catch (e) { fullText += chunkStr; onChunk(fullText); }
        }
        return fullText;
    } catch (error) {
        if (!signal?.aborted) {
            console.warn("Backend proxy failed for sendMessageToChat, falling back to client-side SDK.", error);

            const ai = await getGenAIClient();
            const chatHistory = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

            const chat = ai.chats.create({ model, history: chatHistory, config: { systemInstruction: options.systemInstruction } });

            // Send complete multimodal message with all parts
            const resultStream = await chat.sendMessageStream({ message: messageParts });

            let fullText = '';
            for await (const chunk of resultStream) {
                if (signal?.aborted) break;
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    onChunk(fullText);
                }
            }
            return fullText;
        }
        throw error;
    }
};

export const queryArchitect = async (query: string): Promise<string> => {
    return generateText(query, { model: GEMINI_PRO_MODEL, systemInstruction: 'You are the Senior Software Architect...' });
};

export const aiManagerStrategy = async (prompt: string, userProfile: UserProfile['businessProfile']): Promise<{ strategyText: string; suggestions: string[] }> => {
    // Enable Thinking for strategic tasks
    const systemInstruction = `You are a marketing expert...`;

    // Use Thinking Model here for better strategy
    const response = await generateText(prompt, {
        useThinking: true, // Enable thinking mode
        systemInstruction,
        // tools: [{ googleSearch: {} }], // Tools disabled when using thinking to prevent "Tool use with JSON mime type" error
        thinkingBudget: 2048
    });

    return { strategyText: response, suggestions: ["Suggestion 1", "Suggestion 2"] };
};

export const campaignBuilder = async (campaignPrompt: string): Promise<{ campaign: Campaign; videoUrl?: string }> => {
    const planPrompt = `Create a detailed marketing campaign plan...`;
    const planJsonStr = await generateText(planPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json',
        // responseSchema to be added if needed
    });

    let plan;
    try {
        plan = JSON.parse(planJsonStr);
    } catch (e) {
        plan = { campaignName: "Campaign " + Date.now() };
    }

    const { generateVideo } = await import('./video');

    let videoUrl: string | undefined = undefined;
    try {
        videoUrl = await generateVideo(`A short promo video for ${plan.campaignName}`);
    } catch (e) {
        console.warn("Video generation failed for campaign", e);
    }

    return { campaign: { id: `c-${Date.now()}`, name: plan.campaignName, type: 'general', posts: [], ads: [], timeline: '', createdAt: new Date().toISOString(), userId: 'mock-user-123' }, videoUrl };
};

export const searchTrends = async (query: string, language: string = 'en-US'): Promise<Trend[]> => {
    const prompt = language === 'pt-BR'
        ? `Encontre as tendências de marketing atuais para "${query}". Forneça um resumo detalhado em português.`
        : `Find current marketing trends for "${query}". Provide a detailed summary.`;

    try {
        const response = await proxyFetch<any>('call-gemini', 'POST', {
            model: GEMINI_FLASH_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { tools: [{ googleSearch: {} }] },
        });
        const text = response.response?.text;
        const groundingMetadata = response.response?.candidates?.[0]?.groundingMetadata;
        return [{ id: `trend-${Date.now()}`, query, score: 85, data: text || '', sources: groundingMetadata?.groundingChunks?.map((c: any) => c.web) || [], createdAt: new Date().toISOString(), userId: 'mock-user-123' }];
    } catch (error) {
        console.warn("Backend proxy failed for searchTrends, falling back to client-side SDK.", error);
        const ai = await getGenAIClient();
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        const text = response.text;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        return [{ id: `trend-${Date.now()}`, query, score: 85, data: text || '', sources: groundingMetadata?.groundingChunks?.map((c: any) => c.web) || [], createdAt: new Date().toISOString(), userId: 'mock-user-123' }];
    }
};
