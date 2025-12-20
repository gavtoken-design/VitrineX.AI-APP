
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

async function testImageGen() {
    let apiKey = process.argv[2];

    if (!apiKey) {
        try {
            const envPath = path.resolve(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const env = fs.readFileSync(envPath, 'utf8');
                const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
                if (match) apiKey = match[1].trim();
            }
        } catch (e) {
            console.error("Erro ao ler .env:", e.message);
        }
    }

    if (!apiKey) {
        console.error("API Key não encontrada.");
        return;
    }

    console.log("Teste Gemini 2.0 Flash Image Generation...");

    try {
        const client = new GoogleGenAI({ apiKey });
        const modelId = 'gemini-2.0-flash-exp';

        console.log(`Modelo: ${modelId}`);

        // For Gemini 2.0, we might need to use generateContent but ask for an image?
        // Or generateImages if supported.
        // Let's try generateImages first.
        try {
            console.log("Tentando client.models.generateImages com gemini-2.0-flash-exp...");
            const result = await client.models.generateImages({
                model: modelId,
                prompt: "A beautiful futuristic city with flying cars, cinematic lighting, 4k",
                config: { numberOfImages: 1 }
            });
            console.log("Sucesso com generateImages!");
            console.log("Images:", result.generatedImages?.length);
            return;
        } catch (e) {
            console.log("generateImages falhou com Gemini 2.0 Flash Exp:", e.message);
            console.log("Tentando generateContent com output generation...");
        }

        // Gemini 2.0 native image generation usually via generateContent with specific prompts or tools?
        // Actually, for the API, it IS likely generateImages or similar if it's the specific endpoint.

    } catch (error) {
        console.error("Erro fatal:", error);
    }
}

testImageGen();
