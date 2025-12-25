import { ImageOptions, ImageResult } from './image/types';
import { generateImageInternal } from './image/generate';
import { editImageInternal } from './image/edit';
import { analyzeImageInternal } from './image/analyze';

// Re-export types for consumers
export * from './image/types';

/**
 * @description Geração de imagens via Imagen 3.0 / Gemini.
 * @standard RFC - Padronização e Robustez do Módulo de Imagens.
 */
export const generateImage = async (
    prompt: string,
    options?: ImageOptions
): Promise<ImageResult> => {
    return generateImageInternal(prompt, options);
};

/**
 * @description Edição de imagens via instrução (Multimodal).
 * @deprecated Use generateImage com contexto para novas integrações onde possível, 
 * ou este método para manipulação baseada em referência.
 */
export const editImage = async (
    prompt: string,
    base64ImageData: string,
    mimeType: string,
    options?: ImageOptions
): Promise<ImageResult> => {
    return editImageInternal(prompt, base64ImageData, mimeType, options);
};

/**
 * @description Análise de imagens para extração de texto, tendências ou contexto.
 */
export const analyzeImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    options?: ImageOptions
): Promise<ImageResult> => {
    return analyzeImageInternal(base64ImageData, mimeType, prompt, options);
};

/**
 * BACKWARD COMPATIBILITY LAYER
 * Esses métodos garantem que o restante do app não quebre durante a transição,
 * convertendo os novos retornos estruturados para o formato antigo.
 */

export const legacyGenerateImage = async (prompt: string, options?: ImageOptions): Promise<{ imageUrl?: string; text?: string }> => {
    const result = await generateImage(prompt, options);
    if (result.type === 'image') return { imageUrl: result.imageUrl };
    if (result.type === 'text') return { text: result.text };
    throw new Error(result.message);
};

export const legacyAnalyzeImage = async (base64ImageData: string, mimeType: string, prompt: string, modelId?: string): Promise<string> => {
    const result = await analyzeImage(base64ImageData, mimeType, prompt, { model: modelId });
    if (result.type === 'text') return result.text;
    if (result.type === 'image') return result.imageUrl;
    return result.message || 'Erro na análise.';
};
