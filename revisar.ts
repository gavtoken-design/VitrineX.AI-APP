import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("API Key missing");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
    console.log("Perguntando ao Gemini sobre Race Conditions...");
    try {
        const response: any = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: "Explain what a race condition is in C++ in one short sentence.",
        });

        console.log("Raw Response Keys:", Object.keys(response));

        // Handle response structure for @google/genai SDK
        if (response.response && typeof response.response.text === 'function') {
            console.log("\nRESPOSTA DA IA (via response.text()):\n", response.response.text());
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
            console.log("\nRESPOSTA DA IA (via candidates):\n", response.candidates[0].content.parts[0].text);
        } else if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log("\nRESPOSTA DA IA (via data.candidates):\n", response.data.candidates[0].content.parts[0].text);
        } else {
            console.log("Resposta bruta:", JSON.stringify(response, null, 2));
        }
    } catch (e) {
        console.error("Erro:", e);
    }
}

run();
