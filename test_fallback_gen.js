
import fetch from 'node-fetch'; // Standard in modern Node or if type module
// If using older node without native fetch, this might fail, but let's assume standard environment or that we can use the global fetch if available.
// The app uses native fetch or a polyfill. In Node 18+ fetch is global.

async function testFallback() {
    console.log("Testing Pollinations.ai fallback logic...");
    const prompt = "A beautiful futuristic city with flying cars, cinematic lighting, 4k";
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;

    try {
        console.log(`Fetching: ${pollinationsUrl}`);
        const response = await fetch(pollinationsUrl);

        if (!response.ok) {
            console.error(`Falha: ${response.status} - ${response.statusText}`);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        console.log("Success!");
        console.log("Base64 length:", base64.length);
        console.log("First 50 chars:", base64.substring(0, 50));

    } catch (e) {
        console.error("Erro no fetch:", e);
    }
}

testFallback();
