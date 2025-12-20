/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Verificar se as credenciais estão configuradas
const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!isConfigured) {
    console.warn('⚠️ SUPABASE NÃO CONFIGURADO');
    console.warn('📋 Para ativar cadastros/login:');
    console.warn('1. Crie um arquivo .env na raiz do projeto');
    console.warn('2. Adicione as credenciais do Supabase:');
    console.warn('   VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.warn('   VITE_SUPABASE_ANON_KEY=sua_anon_key');
    console.warn('3. Siga o guia: docs/SUPABASE_SETUP.md');
    console.warn('');
    console.warn('🔒 O app funcionará em modo offline (sem cadastro/login)');
} else {
    console.log('✅ Supabase configurado:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = isConfigured;
