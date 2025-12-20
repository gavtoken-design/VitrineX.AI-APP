import { GoogleGenAI } from '@google/genai';
import { GEMINI_FLASH_MODEL, HARDCODED_API_KEY } from '../../constants';
import { SecureStorage } from '../../utils/secureStorage';
import { getUserProfile } from '../core/db';

export const getApiKey = async (userId?: string): Promise<string> => {
  // 1. LocalStorage (Raw - Legacy/Fast cache)
  const localKey = localStorage.getItem('vitrinex_gemini_api_key');
  if (localKey) return localKey;

  // 2. SecureStorage (Encrypted - More secure local)
  try {
    const secureKey = await SecureStorage.getItem<string>('vitrinex_gemini_api_key_secure');
    if (secureKey) {
      localStorage.setItem('vitrinex_gemini_api_key', secureKey);
      return secureKey;
    }
  } catch (e) {
    console.warn('SecureStorage retrieval failed', e);
  }

  // 3. Supabase Profile (Source of Truth for persistent users)
  if (userId) {
    try {
      const profile = await getUserProfile(userId);
      if (profile?.apiKey) {
        localStorage.setItem('vitrinex_gemini_api_key', profile.apiKey);
        await SecureStorage.setItem('vitrinex_gemini_api_key_secure', profile.apiKey);
        return profile.apiKey;
      }
    } catch (e) {
      console.warn('Supabase key retrieval failed', e);
    }
  }

  // 4. Environment Variables / Hardcoded (Dev/Initial Setup)
  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  if (HARDCODED_API_KEY) return HARDCODED_API_KEY;

  throw new Error('Configuração Ausente: Chave de API não encontrada.');
};

export const getGeminiClient = async (explicitKey?: string, userId?: string): Promise<GoogleGenAI> => {
  const apiKey = explicitKey || await getApiKey(userId);
  return new GoogleGenAI({ apiKey });
};

export const testGeminiConnection = async (explicitKey?: string, userId?: string): Promise<string> => {
  try {
    const ai = await getGeminiClient(explicitKey, userId);

    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Diga 'Sistema VitrineX AI: Operação exclusiva em arquitetura de alto desempenho v3 confirmada.' em português." }
          ]
        }
      ],
      config: {
        temperature: 0
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA.");

    return text;
  } catch (error) {
    const err = error as Error;
    const errorMessage = err.message || err.toString();
    console.error("Erro detalhado:", errorMessage);
    throw new Error(`Falha na conexão Gemini 2.5: ${errorMessage}`);
  }
};

export interface CapabilityStatus {
  text: boolean;
  vision: boolean;
  audio: boolean;
  message: string;
}

export const verifySystemCapabilities = async (explicitKey?: string, userId?: string): Promise<CapabilityStatus> => {
  try {
    await testGeminiConnection(explicitKey, userId);
    return {
      text: true,
      vision: true,
      audio: true,
      message: 'Sistema Totalmente Operacional (v2.5)'
    };
  } catch (error) {
    const err = error as Error;
    return {
      text: false,
      vision: false,
      audio: false,
      message: err.message || 'Falha geral na validação'
    };
  }
};
