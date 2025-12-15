import { generateText } from '../ai/text';
import { ChatMessage } from '../../types';
import { GEMINI_FLASH_MODEL } from '../../constants';

// Interface for the Memory Object
export interface ClientMemory {
    userId: string;
    lastUpdated: string;
    summary: string;
    keyFacts: string[]; // Extracted facts like "Sells shoes", "Target audience is women"
    rawContextTokenCount: number;
}

/**
 * Compacts a long chat history into a dense summary for efficient storage.
 * Uses Gemini Flash for speed and cost.
 */
export const compactChatHistory = async (history: ChatMessage[], existingMemory?: ClientMemory): Promise<ClientMemory> => {
    // If history is short, no need to compact yet
    if (history.length < 5) {
        return existingMemory || {
            userId: 'unknown',
            lastUpdated: new Date().toISOString(),
            summary: '',
            keyFacts: [],
            rawContextTokenCount: 0
        };
    }

    const conversationText = history.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
    const existingContext = existingMemory ? `\nPREVIOUS CONTEXT:\n${existingMemory.summary}\nFACTS: ${existingMemory.keyFacts.join(', ')}` : '';

    const prompt = `
    Analyze the following conversation between a User (Store Owner) and an AI Assistant.
    Your task is to create a COMPACT MEMORY UPDATE.
    
    1. **Summary**: Summarize the current session in 3-4 sentences. Focus on goals, problems solved, and current status.
    2. **Key Facts**: Extract specific business details (Niche, Products, Tone, Preferences).
    3. **Ignore**: Casual greetings, short confirmations ("ok", "thanks").
    
    ${existingContext}

    CURRENT CONVERSATION:
    ${conversationText}

    Output format (JSON):
    {
        "summary": "Updated comprehensive summary...",
        "keyFacts": ["Fact 1", "Fact 2"]
    }
    `;

    try {
        const response = await generateText(prompt, {
            model: GEMINI_FLASH_MODEL,
            responseMimeType: 'application/json'
        });

        const data = JSON.parse(response);

        return {
            userId: 'user-timestamp', // In real app, pass actual user ID
            lastUpdated: new Date().toISOString(),
            summary: data.summary || '',
            keyFacts: data.keyFacts || [],
            rawContextTokenCount: conversationText.length / 4 // Approx estimation
        };
    } catch (error) {
        console.error("Memory compaction failed", error);
        return existingMemory || { userId: '', lastUpdated: '', summary: '', keyFacts: [], rawContextTokenCount: 0 };
    }
};
