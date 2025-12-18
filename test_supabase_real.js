
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Função para ler variáveis do arquivo .env manualmente
function loadEnv() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const vars = {};
        env.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                vars[key.trim()] = value.trim();
            }
        });
        return vars;
    } catch (e) {
        console.error("Erro ao ler .env:", e.message);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ ERRO: Credenciais do Supabase não encontradas no .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log("🔄 Iniciando Teste de Conexão com Supabase...");

    // 1. Tentar Login (Autenticação)
    // Usando um email com formato válido e timestamp para ser único
    const email = `test.user.${Date.now()}@vitrinex.ai`;
    const password = 'password123';

    console.log(`\n1️⃣ Testando Autenticação (SignUp com ${email})...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("❌ Erro no SignUp:", authError.message);
        // Se falhar o auth, dificilmente conseguiremos gravar no banco protegido
        return;
    }

    const userId = authData.user?.id;
    console.log("✅ Autenticação Sucesso! User ID:", userId);

    if (!userId) {
        console.error("❌ Falha: User ID nulo após signup.");
        return;
    }

    // 2. Tentar Gravar no Banco (Insert)
    console.log("\n2️⃣ Testando Gravação no Banco (Tabela 'library_items')...");
    const testItem = {
        id: `test-${Date.now()}`,
        userId: userId, // Importante: RLS exige que insert tenha userId igual ao do auth
        type: 'test_health_check',
        file_url: 'http://test.com/check.png',
        name: 'Health Check Item',
        tags: ['test', 'health_check']
    };

    const { data: insertData, error: insertError } = await supabase
        .from('library_items')
        .insert([testItem])
        .select()
        .single();

    if (insertError) {
        console.error("❌ Erro ao Gravar:", insertError.message);
        console.log("💡 Dica: Verifique se a tabela 'library_items' existe e se as políticas RLS permitem insert.");
    } else {
        console.log("✅ Gravação Realizada com Sucesso!");
        console.log("   Item Salvo:", insertData.name, `(ID: ${insertData.id})`);
    }

    // 3. Limpeza (Opcional)
    if (insertData) {
        console.log("\n3️⃣ Limpando dados de teste...");
        const { error: deleteError } = await supabase
            .from('library_items')
            .delete()
            .eq('id', testItem.id);

        if (!deleteError) console.log("✅ Dados de teste removidos.");
    }

    console.log("\n🏁 Teste Finalizado.");
}

testConnection();
