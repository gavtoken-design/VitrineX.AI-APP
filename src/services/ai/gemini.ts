import { GoogleGenAI } from '@google/genai';
import { HARDCODED_API_KEY } from '../../constants';

// NOTE: authService will be moved to ../core/auth, so we use that path anticipation or fix later.
// For now, assuming we will move authService shortly.
// If I write this file before moving authService, the import might fail temporarily or I should point to the old one if I haven't moved it yet.
// Strategy: ALL imports in these new files will point to the NEW locations. I must ensure I move the dependencies roughly at the same time or before usage if running checks.
// However, since I'm doing this in a batch, I'll set the "future" paths.

// import { getApiKey as getAuthApiKey } from '../core/keys'; // derived from keyManager or similar?
// Wait, the original geminiService had getApiKey. Let's look at where it got it.
// It was a local helper function.

export const getApiKey = async (): Promise<string> => {
  const localKey = localStorage.getItem('vitrinex_gemini_api_key');
  if (localKey) return localKey;
  if (process.env.API_KEY) return process.env.API_KEY;
  if (HARDCODED_API_KEY) return HARDCODED_API_KEY;
  throw new Error('Chave de API não encontrada.');
};

export const getGenAIClient = async (explicitKey?: string): Promise<GoogleGenAI> => {
  const apiKey = explicitKey || await getApiKey();
  return new GoogleGenAI({ apiKey });
};

export const testGeminiConnection = async (explicitKey?: string): Promise<string> => {
  const ai = await getGenAIClient(explicitKey);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  return response.text || 'No response text received';
};
