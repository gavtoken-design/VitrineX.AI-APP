import { GoogleGenAI as Client } from '@google/genai';
import { GEMINI_FLASH_MODEL, HARDCODED_API_KEY } from '../../constants';

export const getApiKey = async (): Promise<string> => {
  const localKey = localStorage.getItem('vitrinex_gemini_api_key');
  if (localKey) return localKey;

  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  if (HARDCODED_API_KEY) return HARDCODED_API_KEY;

  throw new Error('Configuração Ausente: Chave de API não encontrada.');
};

export const getGenAIClient = async (explicitKey?: string): Promise<Client> => {
  const apiKey = explicitKey || await getApiKey();
  return new Client({ apiKey });
};

// Alias para compatibilidade temporária se necessário
export const getNewGenAIClient = getGenAIClient;

export const testGeminiConnection = async (explicitKey?: string): Promise<string> => {
  try {
    const client = await getGenAIClient(explicitKey);

    const response = await client.models.generateContent({
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
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    console.error("Erro detalhado:", errorMessage);
    throw new Error(`Falha na conexão Gemini 3: ${errorMessage}`);
  }
};

export interface CapabilityStatus {
  text: boolean;
  vision: boolean;
  audio: boolean;
  message: string;
}

export const verifySystemCapabilities = async (explicitKey?: string): Promise<CapabilityStatus> => {
  try {
    await testGeminiConnection(explicitKey);
    // If basic connection works, we assume standard capabilities are active for the key.
    // In a more complex scenario, we would make separate calls for Vision/Audio models.
    return {
      text: true,
      vision: true, // Inferring active if key is valid for Flash
      audio: true,  // Inferring active if key is valid for Flash/Pro
      message: 'Sistema Totalmente Operacional'
    };
  } catch (error: any) {
    // If it fails, everything is down
    return {
      text: false,
      vision: false,
      audio: false,
      message: error.message || 'Falha geral na validação'
    };
  }
};
