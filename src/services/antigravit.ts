/**
 * PROTOCOLO ANTIGRAVIT: MEMÓRIA ATIVA
 * Serviço responsável por registrar interações no banco de dados remoto.
 */
import { supabase } from '../lib/supabase'; // Importação necessária para o contexto de autheticação

// === MÓDULO DE MEMÓRIA HÍBRIDA (Supabase + MySQL) ===

export const Antigravit_Memorizar = async (promptUsuario: string, respostaIA: string, textoEditado: string | null = null) => {
    console.log("⚡ Iniciando gravação de memória...");

    // 1. Tenta pegar o ID do usuário logado no Supabase
    let usuarioID = 'visitante_anonimo';

    try {
        if (typeof supabase !== 'undefined') {
            const { data } = await supabase.auth.getUser();
            if (data && data.user) {
                usuarioID = data.user.id; // Ex: "a12b3c..."
                console.log("👤 Usuário identificado:", data.user.email);
            }
        }
    } catch (e) {
        console.warn("⚠️ Supabase não detectado ou usuário deslogado.");
    }

    // 2. Prepara o pacote para a Hostinger
    const pacoteDeDados = {
        session_id: usuarioID,      // O ID do Supabase vai aqui!
        tipo_acao: 'geracao_ia',
        prompt: promptUsuario,
        resposta: respostaIA,
        versao_final: textoEditado
    };

    // 3. Envia para o seu servidor MySQL
    try {
        // Ajuste a URL se necessário
        const urlAPI = 'https://vitrinex.site/api/registrar_treino.php';

        const response = await fetch(urlAPI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pacoteDeDados)
        });

        // Tentar parsear JSON, com proteção
        try {
            const resultado = await response.json();
            if (resultado.status === 'sucesso') {
                console.log("✅ Memória consolidada no Servidor.");
            } else {
                console.warn("⚠️ Erro no servidor:", resultado.msg);
            }
        } catch (jsonErr) {
            const text = await response.text();
            console.warn("⚠️ Resposta não-JSON do servidor:", text);
        }

    } catch (erro) {
        console.error("❌ Falha na conexão com Hostinger:", erro);
    }
}
