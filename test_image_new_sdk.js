
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

    console.log("Iniciando teste de geração de imagem com @google/genai...");
    
    try {
        const client = new GoogleGenAI({ apiKey });
        const modelId = 'imagen-3.0-generate-001'; // Same as IMAGEN_ULTRA_MODEL

        console.log(`Modelo: ${modelId}`);

        // Try using the same method as in the app
        console.log("Chamando client.models.generateImages...");
        
        // Inspect if method exists
        if (typeof client.models.generateImages !== 'function') {
             console.error("ERRO: client.models.generateImages não é uma função!");
             // Check what exists
             console.log("Métodos disponíveis em client.models:", Object.getOwnPropertyNames(Object.getPrototypeOf(client.models)));
             return;
        }

        const result = await client.models.generateImages({
            model: modelId,
            prompt: "A beautiful futuristic city with flying cars, cinematic lighting, 4k",
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9" // Check valid aspect ratios for this model
            }
        });

        console.log("Resultado obtido.");
        if (result.generatedImages && result.generatedImages.length > 0) {
            console.log("Sucesso! Imagem gerada.");
            const img = result.generatedImages[0];
            console.log("MimeType:", img.image?.mimeType);
            console.log("Base64 length:", img.image?.base64?.length);
        } else {
            console.error("Nenhuma imagem retornada.", JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("Erro durante a geração:", error);
        if (error.response) {
             console.error("Detalhes da resposta:", JSON.stringify(error.response, null, 2));
        }
    }
}

testImageGen();
