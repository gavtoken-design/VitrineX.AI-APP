import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Security / Navigation Utilities

export const ALLOWED_DOMAINS = [
  "google.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "linkedin.com",
  "pinterest.com",
  "github.com",
  "openai.com",
  "anthropic.com",
  "localhost",
  "vitrinex.ai"
];

/**
 * Verifica se uma URL pertence à lista de domínios permitidos.
 * Útil para prevenir redirecionamentos abertos ou navegação insegura.
 */
export function isUrlAllowed(urlString: string, customAllowlist?: string[]): boolean {
  try {
    // Adiciona protocolo se faltar para o URL construtor funcionar
    const fullUrl = urlString.startsWith('http') ? urlString : `https://${urlString}`;
    const url = new URL(fullUrl);
    const hostname = url.hostname;
    const list = customAllowlist || ALLOWED_DOMAINS;

    return list.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (e) {
    console.warn("Invalid URL checked:", urlString);
    return false;
  }
}

/**
 * Aplica o conteúdo do usuário em um template de prompt inteligente.
 * Procura por padrões como {argument name="subject" default="..."}
 */
export function applyPromptTemplate(template: string, content: string): string {
  if (!content.trim()) return template;

  // 1. Tentar detectar se é um Template JSON (Matriz Criativa V2)
  let isJson = false;
  let jsonObj: any = null;

  try {
    if (template.trim().startsWith('{')) {
      jsonObj = JSON.parse(template);
      isJson = true;
    }
  } catch (e) {
    // Não é JSON válido, segue como texto
  }

  // Regex para encontrar os argumentos: {argument name="..." default="..."} ou com aspas simples
  const argRegex = /\{argument name=\\?["']([^"']+)\\?["'] default=\\?["']([^"']+)\\?["']\}/g;

  // Função auxiliar para processar string
  const processString = (str: string, userContent: string) => {
    const matches = [...str.matchAll(argRegex)];
    if (matches.length === 0) return null;

    // Tenta encontrar o melhor argumento para o conteúdo
    const priorityNames = ['subject', 'product', 'content', 'objeto', 'miniature prop', 'brand name', 'flavor name', 'burst type', 'background color', 'key light'];
    let bestMatchIndex = -1;

    for (const name of priorityNames) {
      bestMatchIndex = matches.findIndex(m => m[1].toLowerCase().includes(name));
      if (bestMatchIndex !== -1) break;
    }
    if (bestMatchIndex === -1) bestMatchIndex = 0;

    let currentMatch = 0;
    return str.replace(argRegex, (match, name, defaultValue) => {
      if (currentMatch === bestMatchIndex) {
        currentMatch++;
        return userContent;
      }
      currentMatch++;
      return defaultValue;
    });
  };

  if (isJson && jsonObj?.image_prompt?.scene?.description) {
    // --- Lógica para JSON ---
    const description = jsonObj.image_prompt.scene.description;
    const processedDesc = processString(description, content);

    if (processedDesc) {
      // Caso 1: Encontrou argumentos e substituiu
      jsonObj.image_prompt.scene.description = processedDesc;
    } else {
      // Caso 2: Não tem argumentos, anexa inteligentemente ao final da descrição
      // Verifica pontuação final
      const cleanDesc = description.trim();
      const separator = cleanDesc.endsWith('.') ? ' ' : '. ';
      jsonObj.image_prompt.scene.description = `${cleanDesc}${separator}Foco principal: ${content}`;
    }

    return JSON.stringify(jsonObj, null, 2);
  }

  // --- Lógica para Texto Comum (Fallback) ---
  const processed = processString(template, content);
  if (processed) return processed;

  // Se não tem argumentos, anexa ao final
  return `${template}\n\nAssunto: ${content}`;
}
