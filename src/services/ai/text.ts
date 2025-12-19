import {
    GEMINI_FLASH_MODEL,
    GEMINI_PRO_MODEL,
    GEMINI_THINKING_MODEL,
} from '../../constants';
import {
    ChatMessage,
    Trend,
    Campaign
} from '../../types';
import { getGeminiClient } from './gemini';

export interface GenerateTextOptions {
    model?: string;
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
    thinkingBudget?: number;
    useThinking?: boolean;
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    seed?: number;
    tools?: any[];
    toolConfig?: any;
    userId?: string;
}

const getSystemInstruction = (base?: string, hasTools?: boolean): string | undefined => {
    const agentInstruction = hasTools ? `\n\nWhen thinking silently: ALWAYS start the thought with a brief (one sentence) recap of the current progress on the task. In particular, consider whether the task is already done.` : '';
    const full = base ? `${base}${agentInstruction}` : (agentInstruction ? agentInstruction.trim() : undefined);
    return full;
};

export const generateText = async (prompt: string, options?: GenerateTextOptions): Promise<string> => {
    const modelToUse = options?.useThinking ? GEMINI_THINKING_MODEL : (options?.model || GEMINI_FLASH_MODEL);
    const defaultTemp = 1.0;

    const generationConfig = {
        temperature: options?.temperature ?? defaultTemp,
        topK: options?.topK,
        topP: options?.topP,
        maxOutputTokens: options?.maxOutputTokens,
        stopSequences: options?.stopSequences,
        responseMimeType: options?.responseMimeType,
        responseSchema: options?.responseSchema,
    };

    try {
        const ai = await getGeminiClient(undefined, options?.userId);

        // Direct SDK usage
        const result = await ai.models.generateContent({
            model: modelToUse,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...generationConfig,
                systemInstruction: getSystemInstruction(options?.systemInstruction, !!options?.tools),
                tools: options?.tools as any
            }
        });

        // Basic autonomous agent loop for Gemini SDK
        if (result.functionCalls && result.functionCalls.length > 0) {
            let history: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
            let currentResponse = result;
            let iterations = 0;
            const MAX_ITERATIONS = 5;

            while (currentResponse.functionCalls && currentResponse.functionCalls.length > 0 && iterations < MAX_ITERATIONS) {
                iterations++;
                const calls = currentResponse.functionCalls;
                const toolResponses: any[] = [];

                // Add modedel's turn to history
                // The new SDK patterns often expect candidate content to be sent back
                history.push(currentResponse.candidates?.[0]?.content || { role: 'model', parts: [{ functionCall: calls[0] }] });

                if (calls) {
                    for (const call of calls) {
                        try {
                            const { executeTool } = await import('./tools');
                            const toolResult = await executeTool(call.name, call.args, { userId: options?.userId });
                            toolResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    response: { result: toolResult }
                                }
                            });
                        } catch (toolError) {
                            console.error(`Falha ao executar ferramenta ${call.name}:`, toolError);
                            toolResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    response: { error: `Erro na ferramenta: ${(toolError as Error).message}` }
                                }
                            });
                        }
                    }
                }

                // Add tool outputs as user role in the next turn
                history.push({ role: 'user', parts: toolResponses });

                // Call model again with history
                currentResponse = await ai.models.generateContent({
                    model: modelToUse,
                    contents: history,
                    config: {
                        ...generationConfig,
                        systemInstruction: getSystemInstruction(options?.systemInstruction, !!options?.tools),
                        tools: options?.tools as any
                    }
                });
            }
            return currentResponse.text || '';
        }

        return result.text || '';

    } catch (error: any) {
        console.error("SDK generation failed:", error);
        if (error.message?.includes('429')) {
            throw new Error("Limite de requisições atingido. Por favor, aguarde ou faça o upgrade da licença.");
        }
        throw error;
    }
};

export const countTokens = async (text: string, modelId: string = GEMINI_FLASH_MODEL, userId?: string): Promise<number> => {
    try {
        const client = await getGeminiClient(undefined, userId);
        const result = await client.models.countTokens({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text }] }]
        });
        return result.totalTokens || 0;
    } catch (error) {
        console.warn("Falha ao contar tokens:", error);
        return 0;
    }
};

export const sendMessageToChat = async (
    history: ChatMessage[],
    message: string | any[],
    onChunk: (text: string) => void,
    options: { model?: string; systemInstruction?: string; useKnowledgeBase?: boolean; useThinking?: boolean; userId?: string; tools?: any[] },
    signal?: AbortSignal
): Promise<string> => {
    const modelToUse = options.useThinking ? GEMINI_THINKING_MODEL : (options.model || GEMINI_PRO_MODEL);

    try {
        const client = await getGeminiClient(undefined, options.userId);

        // Convert history to @google/genai format
        const chatHistory = history.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const promptText = typeof message === 'string' ? message : message.map(p => typeof p === 'string' ? p : p.text).join(' ');

        // Using generateContent with history as 'contents' to simulate chat, as startChat might have different semantics in new SDK or we want unified control
        // But for stream, checking if we need streamGenerateContent
        // For now, mirroring the non-streaming logic first, or using standard generateContent.

        // Construct full contents: history + new user message
        const fullContents = [
            ...chatHistory,
            { role: 'user', parts: [{ text: promptText }] }
        ];

        const result = await client.models.generateContent({
            model: modelToUse,
            contents: fullContents,
            config: {
                temperature: 1.0,
                systemInstruction: getSystemInstruction(options.systemInstruction, !!(options.tools || options.useKnowledgeBase)),
                tools: options.tools as any
            }
        });

        // Simple loop handling for tools similar to generateText if needed. 
        // For chat, we often want single turn or specific handling. 
        // Assuming single turn response for basic chat unless complex agent.

        const text = result.text;
        onChunk(text || ''); // Send full text as one chunk for now since we aren't using streamGenerateContent yet
        return text || '';

    } catch (error) {
        console.error("Chat request failed", error);
        throw error;
    }
};

export const aiManagerStrategy = async (prompt: string, userId: string): Promise<{ strategyText: string; suggestions: string[] }> => {
    const { vitrinexTools } = await import('./tools');
    const response = await generateText(prompt, {
        useThinking: true,
        systemInstruction: `You are a marketing expert for VitrineX AI. Your goal is to maximize the ROI.`,
        tools: vitrinexTools,
        userId: userId
    });
    return { strategyText: response, suggestions: ["Otimizar SEO", "Campanha de Retargeting"] };
};

export const searchTrends = async (query: string, language: string = 'en-US'): Promise<Trend[]> => {
    const prompt = language === 'pt-BR'
        ? `Encontre as tendências de marketing atuais para "${query}". Forneça um resumo detalhado em português.`
        : `Find current marketing trends for "${query}". Provide a detailed summary.`;

    try {
        const client = await getGeminiClient(undefined, 'system-search');

        const result = await client.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }] as any
            }
        });

        return [{
            id: `trend-${Date.now()}`,
            query,
            score: 85,
            data: result.text || 'Sem dados.',
            sources: [],
            createdAt: new Date().toISOString(),
            userId: 'mock-user-123'
        }];
    } catch (error) {
        console.error("searchTrends failed", error);
        return [];
    }
};

export const campaignBuilder = async (campaignPrompt: string): Promise<{ campaign: Campaign }> => {
    const planPrompt = `Crie um plano de campanha de marketing 360 completo:
    
    Contexto: ${campaignPrompt}
    
    Retorne um JSON estruturado com:
    1. name: Nome da campanha
    2. description: Descrição geral
    3. timeline: Cronograma sugerido (ex: 2 semanas, frequências)
    4. hashtags: Array de hashtags recomendadas por rede
    5. strategy: Texto detalhando apps em tendência e formatos (Reels, TikTok, etc.)
    6. posts: Array de objetos { content_text: "...", date: "..." }
    7. ads: Array de objetos { platform: "...", headline: "...", copy: "..." }
    
    Retorne APENAS o JSON puro.`;

    const planJsonStr = await generateText(planPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json'
    });

    let plan;
    try {
        plan = JSON.parse(planJsonStr.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
        plan = {
            name: "Campanha " + Date.now(),
            description: "Campanha gerada automaticamente",
            timeline: "2 semanas",
            strategy: "Focar em vídeos curtos e engajamento orgânico.",
            hashtags: [],
            posts: [],
            ads: []
        };
    }

    return {
        campaign: {
            id: `c-${Date.now()}`,
            name: plan.name || plan.campaignName || "Nova Campanha",
            type: 'general',
            description: plan.description,
            strategy: plan.strategy,
            hashtags: plan.hashtags,
            posts: plan.posts || [],
            ads: plan.ads || [],
            timeline: plan.timeline || '',
            createdAt: new Date().toISOString(),
            userId: 'mock-user-123'
        }
    };
};
