import axios from 'axios';
import { supabase } from '../../lib/supabase';

// URL base da sua API na Hostinger
// Idealmente, mova isso para o .env como VITE_HOSTINGER_API_URL
const HOSTINGER_API_URL = import.meta.env.VITE_HOSTINGER_API_URL || 'https://seusite.com/api';

/**
 * Serviço para comunicação com o backend PHP na Hostinger
 */
export const hostingerApi = {
    /**
     * Salva um log de interação com a IA no banco MySQL da Hostinger
     */
    async saveMemory(prompt: string, response: string, module: string = 'general') {
        try {
            // 1. Obter a sessão atual do Supabase
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.warn('[HostingerAPI] Usuário não autenticado. Memória não salva.');
                return null;
            }

            // 2. Preparar os dados
            const payload = {
                prompt,
                response,
                module
            };

            // 3. Enviar para a API PHP
            // Nota: O script PHP deve estar em /api/salvar_memoria.php no seu servidor
            const targetUrl = `${HOSTINGER_API_URL}/salvar_memoria.php`;

            console.log(`[HostingerAPI] Enviando memória para: ${targetUrl}`);

            const res = await axios.post(targetUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}` // Token JWT para validação
                }
            });

            if (res.data && res.data.status === 'sucesso') {
                console.log('[HostingerAPI] Memória salva com sucesso! ID:', res.data.id);
                return res.data;
            } else {
                console.warn('[HostingerAPI] Resposta inesperada:', res.data);
                return null;
            }

        } catch (error) {
            console.error('[HostingerAPI] Erro ao salvar memória:', error);
            // Não queremos quebrar o fluxo do app se o log falhar, então apenas logamos o erro
            return null;
        }
    }
};
