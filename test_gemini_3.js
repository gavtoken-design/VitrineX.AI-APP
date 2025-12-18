import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

async function test() {
    // Tenta ler key de argumento ou .env
    const keyArg = process.argv[2];
    let apiKey = keyArg;

    if (!apiKey) {
        try {
            const env = fs.readFileSync('.env', 'utf8');
            const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        } catch (e) {
            console.log("Nenhuma chave encontrada em .env ou argumentos.");
            console.log("Uso: node test_gemini_3.js SUA_KEY_AQUI");
            return;
        }
    }

    if (!apiKey) {
        console.error("Erro: API Key não fornecida.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-1.5-flash', // Fallback/Current Standard
        'gemini-1.5-pro',
        // 'gemini-2.0-flash-exp' // Future/Experimental
    ];

    console.log('--- Testing Gemini Models (CLI) ---');

    for (const modelId of modelsToTest) {
        try {
            console.log(`Checking [${modelId}]...`);
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent("Diga 'OK' se você está funcionando.");
            const response = await result.response;
            console.log(`[${modelId}] SUCCESS: ${response.text().trim()}`);
        } catch (e) {
            console.error(`[${modelId}] FAILED: ${e.message}`);
        }
    }
}

test();
