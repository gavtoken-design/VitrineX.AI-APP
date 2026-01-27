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
    responseSchema?: Record<string, unknown>;
    thinkingBudget?: number;
    useThinking?: boolean;
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    seed?: number;
    tools?: Record<string, unknown>[];
    toolConfig?: Record<string, unknown>;
    userId?: string;
}

export interface ToolCallResponse {
    functionResponse: {
        name: string;
        response: {
            result?: unknown;
            error?: string;
        };
    };
}

export interface ModelPart {
    text?: string;
    functionCall?: {
        name: string;
        args: Record<string, unknown>;
    };
    functionResponse?: {
        name: string;
        response: Record<string, unknown>;
    };
}

export interface ModelContent {
    role: 'user' | 'model' | 'system';
    parts: ModelPart[];
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
        const client = await getGeminiClient(undefined, options?.userId);

        // Direct SDK usage
        const result = await client.models.generateContent({
            model: modelToUse,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...generationConfig,
                systemInstruction: getSystemInstruction(options?.systemInstruction, !!options?.tools),
                tools: options?.tools
            }
        });

        // Basic autonomous agent loop for Gemini SDK
        if (result.functionCalls && result.functionCalls.length > 0) {
            let history: ModelContent[] = [{ role: 'user', parts: [{ text: prompt }] }];
            let currentResponse = result;
            let iterations = 0;
            const MAX_ITERATIONS = 5;

            while (currentResponse.functionCalls && currentResponse.functionCalls.length > 0 && iterations < MAX_ITERATIONS) {
                iterations++;
                const activeCalls = currentResponse.functionCalls;
                const toolResponses: ToolCallResponse[] = [];

                // Add model's turn to history
                // NEW: Collect all function calls from the result
                const modelParts: ModelPart[] = activeCalls.map(call => ({
                    functionCall: {
                        name: call.name,
                        args: call.args as Record<string, unknown>
                    }
                }));

                history.push({
                    role: 'model',
                    parts: modelParts
                });

                if (activeCalls) {
                    for (const call of activeCalls) {
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
                history.push({
                    role: 'user',
                    parts: toolResponses.map(tr => ({
                        functionResponse: tr.functionResponse
                    }))
                });

                // Call model again with history
                currentResponse = await client.models.generateContent({
                    model: modelToUse,
                    contents: history as any[], // Cast to avoid deep type mismatch with SDK
                    config: {
                        ...generationConfig,
                        systemInstruction: getSystemInstruction(options?.systemInstruction, !!options?.tools),
                        tools: options?.tools
                    }
                });
            }
            return currentResponse.text || (currentResponse as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        return result.text || (result as any).candidates?.[0]?.content?.parts?.[0]?.text || '';

    } catch (error) {
        const err = error as Error & { message?: string };
        console.error("SDK generation failed:", err);
        if (err.message?.includes('429')) {
            throw new Error("Limite de requisições atingido. Por favor, aguarde ou faça o upgrade da licença.");
        }
        throw error;
    }
};


export const translateText = async (text: string, targetLanguage: string, sourceLanguage: string): Promise<string> => {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n"${text}"`;
    try {
        const translatedText = await generateText(prompt, {
            model: GEMINI_FLASH_MODEL,
            temperature: 0.3,
            maxOutputTokens: 1024,
        });
        return translatedText.trim();
    } catch (error) {
        console.error("Translation failed:", error);
        // Fallback to original text if translation fails
        return text;
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
    message: string | { text: string }[],
    onChunk: (text: string) => void,
    options: {
        model?: string;
        systemInstruction?: string;
        useKnowledgeBase?: boolean;
        useThinking?: boolean;
        userId?: string;
        tools?: Record<string, unknown>[]
    },
    signal?: AbortSignal
): Promise<string> => {
    const modelToUse = options.useThinking ? GEMINI_THINKING_MODEL : (options.model || GEMINI_PRO_MODEL);

    try {
        const client = await getGeminiClient(undefined, options.userId);

        // Convert history to @google/genai format
        const chatHistory: ModelContent[] = history.map(m => {
            const parts: ModelPart[] = [];

            if (m.text) {
                parts.push({ text: m.text });
            }

            if (m.toolCall) {
                parts.push({
                    functionCall: {
                        name: m.toolCall.name,
                        args: m.toolCall.args
                    }
                });
            }

            return {
                role: m.role as 'user' | 'model',
                parts
            };
        });

        const promptText = typeof message === 'string' ? message : message.map(p => typeof p === 'string' ? p : p.text).join(' ');

        // Construct full contents: history + new user message
        const fullContents: ModelContent[] = [
            ...chatHistory,
            { role: 'user', parts: [{ text: promptText }] }
        ];

        const result = await client.models.generateContentStream({
            model: modelToUse,
            contents: fullContents as any[],
            config: {
                temperature: 1.0,
                systemInstruction: getSystemInstruction(options.systemInstruction, !!(options.tools || options.useKnowledgeBase)),
                tools: options.tools
            }
        });

        let fullText = '';
        // In @google/genai, generateContentStream returns an AsyncGenerator directly or an object with a stream property
        // Let's handle both common patterns
        const chunks = (result as any).stream || result;

        for await (const chunk of chunks) {
            const chunkText = chunk.text || (chunk as any).candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
                fullText += chunkText;
                onChunk(chunkText);
            }
        }

        return fullText;

    } catch (error) {
        console.error("Chat request failed", error);
        throw error;
    }
};

export const aiManagerStrategy = async (prompt: string, userId: string): Promise<{ strategyText: string; suggestions: string[] }> => {
    const { vitrinexTools } = await import('./tools');
    const response = await generateText(`${prompt}\n\nApós o detalhamento, adicione uma seção "SUGESTÕES_AÇÃO" no final, em formato JSON: {"suggestions": ["...", "..."]}`, {
        useThinking: true,
        systemInstruction: `You are a marketing expert for VitrineX AI. Your goal is to maximize the ROI.`,
        tools: vitrinexTools,
        userId: userId
    });

    try {
        const jsonMatch = response.match(/\{"suggestions":\s*\[.*\]\}/s);
        if (jsonMatch) {
            const { suggestions } = JSON.parse(jsonMatch[0]);
            return { strategyText: response.replace(jsonMatch[0], '').trim(), suggestions };
        }
    } catch (e) {
        console.warn("Falha ao extrair sugestões da estratégia", e);
    }

    return { strategyText: response, suggestions: ["Otimizar SEO", "Campanha de Retargeting"] };
};

export const searchTrends = async (query: string, language: string = 'en-US', userId: string = 'anonymous'): Promise<Trend[]> => {
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
            userId: userId
        }];
    } catch (error) {
        console.error("searchTrends failed", error);
        return [];
    }
};

export const campaignBuilder = async (campaignPrompt: string, userId: string = 'anonymous'): Promise<{ campaign: Campaign }> => {
    const planPrompt = `Atue como um CMO (Diretor de Marketing) de classe mundial especialista em Growth Hacking e Copywriting.
    
    OBJETIVO: Criar uma campanha de marketing de ALTO IMPACTO e CONVERSÃO para: "${campaignPrompt}".
    
    A campanha deve fugir do óbvio. Não use conselhos genéricos. Entregue uma estratégia validada.
    
    Retorne ESTRITAMENTE um JSON com esta estrutura:
    {
      "name": "Nome Magnético da Campanha",
      "description": "O Conceito Central (Big Idea) e a tese de por que isso vai vender/engajar.",
      "timeline": "Cronograma tático (ex: 3 dias de Aquecimento + 4 dias de Lançamento + Remarketing)",
      "hashtags": ["tags_de_nicho", "tags_virais"],
      "strategy": "Análise Estratégica: Defina o Funil de Vendas, o Tom de Voz (Brand Persona) e os Gatilhos Mentais que serão ativados.",
      "posts": [
        { "content_text": "Roteiro detalhado para REELS/TIKTOK (comece com um gancho visual, desenvolva a história, e termine com CTA clara).", "date": "Fase 1 - Dia 1" },
        { "content_text": "Legenda para CARROSSEL educacional que quebra objeções do cliente...", "date": "Fase 2 - Dia 3" },
        { "content_text": "Tweet/Threads provocativo para gerar polêmica/discussão...", "date": "Fase 2 - Dia 3" }
      ],
      "ads": [
        { "platform": "Instagram Stories", "headline": "Texto Sobreposto no Vídeo (Gancho)", "copy": "Script falado para o Story (foco em urgência/escassez)..." },
        { "platform": "Meta Ads (Feed)", "headline": "Título da oferta (Headline)", "copy": "Legenda do anúncio usando framework PAS (Problema-Agitação-Solução)..." }
      ]
    }
    
    IMPORTANTE:
    1. Seja ESPECÍFICO no conteúdo. Diga exatamente o que falar/fazer.
    2. Use psicologia do consumidor (Gatilhos mentais).
    3. Retorne APENAS o JSON puro.`;

    const planJsonStr = await generateText(planPrompt, {
        model: GEMINI_PRO_MODEL,
        responseMimeType: 'application/json',
        temperature: 0.7 // Pouco mais criativo
    });

    let plan;
    try {
        const cleanedJson = planJsonStr.replace(/```json\n?|\n?```/g, '').trim();
        plan = JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Erro ao fazer parse da campanha:", e);
        plan = {
            name: "Erro na Geração",
            description: "Não foi possível gerar a estratégia detalhada. Tente novamente com mais detalhes.",
            timeline: "Revisar",
            strategy: "Erro técnico na IA.",
            hashtags: [],
            posts: [],
            ads: []
        };
    }

    return {
        campaign: {
            id: `c-${Date.now()}`,
            name: plan.name || "Campanha Estratégica",
            type: 'general',
            description: plan.description || "Descrição indisponível",
            strategy: plan.strategy || "Estratégia indisponível",
            hashtags: Array.isArray(plan.hashtags) ? plan.hashtags : (typeof plan.hashtags === 'string' ? plan.hashtags.split(/[\s,]+/).filter(h => h) : []),
            posts: (plan.posts || []).map((p: any, i: number) => ({
                ...p,
                id: `post-${Date.now()}-${i}`,
                userId: userId,
                createdAt: new Date().toISOString()
            })),
            ads: (plan.ads || []).map((a: any, i: number) => ({
                ...a,
                id: `ad-${Date.now()}-${i}`,
                userId: userId,
                createdAt: new Date().toISOString()
            })),
            timeline: plan.timeline || '',
            createdAt: new Date().toISOString(),
            userId: userId
        }
    };
};
