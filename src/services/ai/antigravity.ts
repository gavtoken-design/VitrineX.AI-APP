import { GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL } from '../../constants';
import { getGeminiClient } from './gemini';

export type AntigravityMode = 'scanOnly' | 'fixSafe';
export type AntigravityLanguage = 'ts' | 'js' | 'python';

export interface AntigravityOptions {
    mode?: AntigravityMode;
    language: AntigravityLanguage; // Redução de incerteza: obrigatório
    timeoutMs?: number;
    diffThreshold?: number; // Limite de impacto (Regra 7)
}

export interface AntigravityResult {
    success: boolean;
    output: string;
    mode: AntigravityMode;
    metrics?: {
        durationMs: number;
        modelUsed: string;
        inputSize: number;
        outputSize: number;
    };
    error?: string;
}

/**
 * Antigravit: Protocolo de Sanitização Cirúrgica (Risco Mínimo).
 * 
 * Segue estritamente o guia de 13 pontos para determinismo e segurança.
 */
export const sanitizarCodigoAntigravit = async (
    codigo: string,
    options: AntigravityOptions
): Promise<AntigravityResult> => {
    const startTime = Date.now();
    const {
        mode = 'scanOnly',
        language,
        timeoutMs = 30000,
        diffThreshold = 0.3 // Protocolo: alterações mínimas
    } = options;

    const modelToUse = mode === 'fixSafe' ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;

    // FASE 1 - BLOQUEIO DE RISCO
    // Regra 2: Instruções em role: system. Regra 1: Neutralizar criatividade.
    const instrScan = "Você é o Antigravit (SCAN). Identifique erros sintáticos ou de tipagem. NÃO altere o código. NÃO explique. Retorne uma lista de pontos críticos.";
    const instrFix = `Você é o Antigravit (FIX). Corrija erros sintáticos e de tipagem. 
REGRAS TOTAIS:
1. PROIBIDO: refatorar, renomear variáveis, reformatar estilo ou mudar lógica.
2. SE NÃO HOUVER ERRO: retorne o código idêntico.
3. DELIMITAÇÃO: O código DEVE estar dentro de um bloco Markdown único (\`\`\`${language} ... \`\`\`).
4. INVALIDADE: Qualquer texto fora do bloco Markdown invalida a resposta.
5. DETERMINISMO: Corrija apenas o que impede a execução ou tipagem correta.`;

    const systemInstruction = mode === 'scanOnly' ? instrScan : instrFix;

    try {
        const client = await getGeminiClient();

        const executeCall = async (): Promise<string | undefined> => {
            const result = await client.models.generateContent({
                model: modelToUse,
                contents: [
                    { role: 'system', parts: [{ text: systemInstruction }] },
                    { role: 'user', parts: [{ text: `Linguagem: ${language}\n\nCódigo:\n${codigo}` }] }
                ],
                config: {
                    temperature: 0, // Determinístico
                    topP: 0.1
                }
            });
            return result.text;
        };

        const timeoutPromise = new Promise<undefined>((_, reject) =>
            setTimeout(() => reject(new Error("ANTIGRAVITY_TIMEOUT")), timeoutMs)
        );

        const rawOutput = await Promise.race([executeCall(), timeoutPromise]);

        if (!rawOutput) {
            throw new Error("EMPTY_RESPONSE");
        }

        // FASE 1 - Regra 3 e 4: Delimitação e Falha Explícita
        if (mode === 'fixSafe') {
            const codeBlockRegex = new RegExp(`\`\`\`(?:${language})?\\n([\\s\\S]*?)\\n\`\`\``);
            const match = rawOutput.match(codeBlockRegex);

            if (!match) {
                throw new Error("INVALID_FORMAT: Código ausente ou fora de blocos Markdown.");
            }

            const codeFromBlock = match[1].trim();
            const textOutside = rawOutput.replace(codeBlockRegex, '').trim();

            if (textOutside.length > 3) { // Margem pequena para quebras de linha
                throw new Error("INVALID_FORMAT: Saída contém texto explicativo proibido fora do bloco.");
            }

            // FASE 2 - Regra 7: Limitar impacto (Diff/Similaridade)
            const similarity = calcularSimilaridade(codigo, codeFromBlock);
            if (similarity < (1 - diffThreshold)) {
                return {
                    success: false,
                    output: codigo,
                    mode,
                    error: "OVERCORRECTION_DETECTED: Alteração muito grande rejeitada por segurança."
                };
            }

            // FASE 4 - Regra 13: Remover incertezas
            const cleanedOutput = codeFromBlock
                .replace(/\/\/.*(?:assuming|maybe|for now|talvez|provavelmente).*/gi, '')
                .trim();

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Audit Log (Regra 11)
            console.info(`[Antigravit] ${mode} | ${language} | ${duration}ms | In: ${codigo.length} | Out: ${cleanedOutput.length}`);

            return {
                success: true,
                output: cleanedOutput,
                mode,
                metrics: {
                    durationMs: duration,
                    modelUsed: modelToUse,
                    inputSize: codigo.length,
                    outputSize: cleanedOutput.length
                }
            };
        } else {
            // scanOnly
            return {
                success: true,
                output: rawOutput.trim(),
                mode,
                metrics: {
                    durationMs: Date.now() - startTime,
                    modelUsed: modelToUse,
                    inputSize: codigo.length,
                    outputSize: rawOutput.length
                }
            };
        }

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("[Antigravit] Erro Crítico:", errorMsg);
        return {
            success: false,
            output: codigo,
            mode,
            error: errorMsg
        };
    }
};

/**
 * Heurística de similaridade baseada em volume de caracteres.
 */
function calcularSimilaridade(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    const len1 = str1.length;
    const len2 = str2.length;
    if (len1 === 0 || len2 === 0) return 0;
    const diff = Math.abs(len1 - len2) / Math.max(len1, len2);
    return 1 - diff;
}

// Deprecated alias for backward compatibility
export const executarVarreduraAntigravit = async (codigo: string): Promise<string> => {
    console.warn("executarVarreduraAntigravit is deprecated.");
    const res = await sanitizarCodigoAntigravit(codigo, { mode: 'fixSafe', language: 'ts' });
    return res.output;
};
