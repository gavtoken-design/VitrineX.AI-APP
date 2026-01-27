
export const translateError = (error: any): string => {
  if (!error) return 'Ocorreu um erro desconhecido.';

  const message = (
    error.message ||
    error.error?.message ||
    (typeof error === 'string' ? error : '')
  ).toLowerCase();

  // Auth / Supabase Errors
  if (message.includes('invalid login credentials')) return 'Email ou senha inválidos.';
  if (message.includes('user not found')) return 'Usuário não encontrado.';
  if (message.includes('email not confirmed')) return 'Por favor, confirme seu email antes de entrar.';
  if (message.includes('rate limit')) return 'Muitas tentativas. Tente novamente mais tarde.';
  if (message.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (message.includes('signups are disabled')) return 'Novos cadastros estão temporariamente desativados.';
  if (message.includes('already registered')) return 'Este email já está cadastrado.';
  if (message.includes('network error') || message.includes('failed to fetch')) return 'Erro de conexão. Verifique sua internet.';
  
  // API / Model Errors
  if (message.includes('model not found')) return 'O modelo de IA está indisponível no momento.';
  if (message.includes('quota exceeded') || message.includes('insufficient quota')) return 'Cota de uso da IA excedida. Tente novamente mais tarde.';
  if (message.includes('api key not valid')) return 'Chave de API inválida ou expirada.';
  if (message.includes('content policy violation')) return 'O conteúdo solicitado viola as políticas de segurança da IA.';
  if (message.includes('timeout')) return 'A solicitação demorou muito para responder.';

  // Generic Fallback but keep original slightly visible if needed (or just generic)
  // For end users, generic is often better, but maybe we append a code.
  if (message.length > 0) {
      // If it looks like a raw code, return it, otherwise generic
      return `Erro: ${error.message || error}`;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
};
