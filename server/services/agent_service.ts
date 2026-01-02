import express from 'express';
import axios from 'axios';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configuration
const TESS_API_URL = 'https://tess.pareto.io/api/agents/37390/execute';
// Assuming keys are loaded from env in main index.ts
// Need GOOGLE_APPLICATION_CREDENTIALS for Drive/Sheets or API Keys

// --- Services ---

// 1. Tess Wrapper
async function callTessAI(messages: any[], tools = "no-tools", rootId?: number, agentId: string = "37390") {
    const apiKey = process.env.VITE_TESS_API_KEY || "451280|JRp9ZqfjHIQZfNT8ZJZ0lsipWZY9j23x3ioKHTuv1340925e";
    const apiEndpoint = `https://tess.pareto.io/api/agents/${agentId}/execute`;

    const payload: any = {
        messages,
        stream: false,
        wait_execution: true,
        tools
    };
    if (rootId) payload.root_id = rootId;

    const response = await axios.post(apiEndpoint, payload, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data?.responses?.[0] || { output: "Error", root_id: null };
}

return response.data?.responses?.[0] || { output: "Error", root_id: null };
}

// 2. Google Drive Upload (Mock implementation for plan)
async function saveToDrive(content: string, filename: string) {
    // Requires OAuth2 or Service Account setup
    console.log(`[Mock] Saving to Drive: ${filename}`);
    // implementation would use google.drive({version: 'v3', auth}).files.create(...)
    return true;
}

// 3. Google Search (Mock)
async function googleSearch(query: string) {
    // Requires Custom Search API Key + CX
    console.log(`[Mock] Searching Google: ${query}`);
    return `Search Results for ${query}: ... (Mock Data)`;
}


// --- Routes ---

router.post('/execute', async (req, res) => {
    try {
        const { messages, root_id } = req.body;
        const lastUserMessage = messages[messages.length - 1].content;

        let systemContext = "";

        // --- Step 1: Detect Commands (Pre-Processing) ---
        if (lastUserMessage.startsWith('/search')) {
            const query = lastUserMessage.replace('/search', '').trim();
            const searchResults = await googleSearch(query);
            systemContext = `\n[SYSTEM] User performed a search. Results: ${searchResults}\n`;

            // Inject context into the message sent to Tess
            messages[messages.length - 1].content += systemContext;
        }

        // --- Step 2: Call Tess ---
        const tessResponse = await callTessAI(messages, "no-tools", root_id, req.body.agentId);
        const aiOutput = tessResponse.output;
        const newRootId = tessResponse.root_id;

        // --- Step 3: Post-Processing (Integrations) ---

        // Log to Drive (Fire and forget)
        const logContent = `User: ${lastUserMessage}\nAI: ${aiOutput}`;
        const filename = `chat_log_${Date.now()}.txt`;
        saveToDrive(logContent, filename).catch(err => console.error("Drive save failed", err));

        // Return response to frontend
        res.json({
            responses: [
                {
                    output: aiOutput,
                    root_id: newRootId
                }
            ]
        });

    } catch (error: any) {
        console.error('Agent Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export const agentRouter = router;
