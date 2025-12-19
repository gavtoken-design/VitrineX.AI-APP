import { GEMINI_FLASH_MODEL } from '../../constants';
import { getGeminiClient } from './gemini';

/**
 * Função Antigravit: Varre e limpa o código.
 */
export const executarVarreduraAntigravit = async (codigoSujo: string): Promise<string> => {
    try {
        const client = await getGeminiClient();

        const result = await client.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: [{
                role: 'user',
                parts: [{ text: `Varra o seguinte código e apague todos os erros, corrigindo-os: \n\n${codigoSujo}` }]
            }],
            config: {
                systemInstruction: "Você é o Antigravit. Sua única tarefa é apagar erros e corrigir o código. Não dê explicações. Retorne apenas o código corrigido.",
                temperature: 0
            }
        });

        // O texto retornado será o código limpo
        const textoLimpo = result.text;

        if (!textoLimpo) return codigoSujo;

        // Remove as marcas de blocos de código se a IA as colocar por hábito
        return textoLimpo.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '').trim();
    } catch (error: any) {
        console.error("Falha na varredura Antigravit:", error);
        throw new Error("O Antigravit encontrou um problema ao acessar o núcleo do código.");
    }
};
