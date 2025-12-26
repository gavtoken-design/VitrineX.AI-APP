# Guia de Integração Híbrida: Supabase + Hostinger (MySQL)

Este guia descreve a arquitetura e os passos para integrar o **Supabase** (PostgreSQL/Auth/Realtime) com um banco de dados legado ou econômico na **Hostinger** (MySQL).

---

## 🏗️ Arquitetura Proposta

Não é recomendado (e muitas vezes impossível) conectar o banco do Supabase *diretamente* ao MySQL da Hostinger via conexão de banco de dados pura. A melhor abordagem é usar o **Frontend (App)** ou uma **API Middleware** como ponte.

### Divisão de Responsabilidades

1.  **Supabase (A Camada "Ágil"):**
    *   **Autenticação**: O Supabase gerencia usuários, logins (Google, Email), recuperação de senha e gera os Tokens de Acesso (JWT).
    *   **Realtime**: Se precisar de notificações instantâneas (ex: chat), use o Supabase.
    *   **Dados de UI/Sessão**: Preferências do usuário, rascunhos rápidos.

2.  **Hostinger MySQL (A Camada "Core/Legada"):**
    *   **Armazenamento de Massa**: Dados históricos, logs pesados, catálogo de produtos extenso (se o custo do Supabase for uma preocupação).
    *   **Regras de Negócio Legadas**: Se você já tem sistemas em PHP/Laravel rodando lá.
    *   **Memória da IA (Antigravit)**: Onde guardamos os logs de interação da IA para análise futura.

---

## 🚀 Passo a Passo da Integração

### Passo 1: Configurar o Supabase (Auth)
O Supabase será a "Porta de Entrada".

1.  Crie seu projeto no Supabase.
2.  Configure o Login (Email/Senha, Google, etc).
3.  Obtenha a `JWT Secret` nas configurações do projeto (Settings > API). **Essa chave é crucial para a Hostinger validar quem é o usuário.**

### Passo 2: Criar o Banco de Dados na Hostinger (MySQL)
1.  Acesse o painel da Hostinger (hPanel).
2.  Vá em **Bancos de Dados MySQL** e crie um novo banco (ex: `vitrinex_core`).
3.  Crie a tabela de usuários para "espelhar" os dados do Supabase (opcional, mas recomendado para relacionamentos).

```sql
-- Exemplo de SQL para rodar no phpMyAdmin da Hostinger
CREATE TABLE app_users (
    supabase_uuid VARCHAR(36) PRIMARY KEY, -- O ID que vem do Supabase
    email VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    plano VARCHAR(50)
);

CREATE TABLE ia_memory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    prompt TEXT,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(supabase_uuid)
);
```

### Passo 3: Criar a API na Hostinger (PHP)
Você precisará de scripts PHP na Hostinger para receber os dados do App e validar se o usuário é legítimo (usando o Token do Supabase).

**Exemplo: `api/salvar_memoria.php`**

```php
<?php
// Configurações de CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// 1. Receber o Token JWT enviado pelo App
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    http_response_code(401);
    echo json_encode(["erro" => "Token não fornecido"]);
    exit;
}

// 2. Validar o Token (Simplificado - ideal usar biblioteca firebase/php-jwt)
// Aqui você deve verificar se o token é válido usando a "JWT Secret" do Supabase.
// Se válido, extraia o 'sub' (User ID).
$userIdDoSupabase = "extrair_do_token_jwt($token)"; 

// 3. Conectar ao MySQL
$host = "localhost";
$db = "u123456789_vitrinex";
$user = "u123456789_admin";
$pass = "SuaSenhaForte";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Receber dados do POST
    $data = json_decode(file_get_contents("php://input"));

    // 5. Inserir no MySQL
    $stmt = $conn->prepare("INSERT INTO ia_memory_logs (user_id, prompt, response) VALUES (:uid, :p, :r)");
    $stmt->execute([
        ':uid' => $userIdDoSupabase,
        ':p' => $data->prompt,
        ':r' => $data->response
    ]);

    echo json_encode(["status" => "sucesso", "id" => $conn->lastInsertId()]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no banco: " . $e->getMessage()]);
}
?>
```

### Passo 4: O Aplicativo (Frontend) conecta as pontas
No seu código React/Vite, você fará duas coisas:
1.  Logar no Supabase.
2.  Usar o token recebido para enviar dados para a Hostinger.

**Exemplo no código (`src/services/apiHostinger.ts`):**

```typescript
import { supabase } from '../lib/supabase';

export const salvarMemoriaNaHostinger = async (prompt: string, response: string) => {
    // 1. Pegar a sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        console.error("Usuário não logado");
        return;
    }

    // 2. Enviar para a API PHP
    const res = await fetch('https://seu-site-na-hostinger.com/api/salvar_memoria.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` // Envia o token do Supabase
        },
        body: JSON.stringify({ prompt, response })
    });

    const json = await res.json();
    return json;
};
```

---

## 📌 Resumo do Fluxo

1.  **Usuário** -> Abre o App e faz Login.
2.  **App** -> Pede autenticação ao **Supabase**.
3.  **Supabase** -> Devolve um Token Seguro (JWT).
4.  **Usuário** -> Usa uma função do App (ex: criar post).
5.  **App** -> Envia os dados + Token para o script PHP na **Hostinger**.
6.  **Hostinger (PHP)** -> Valida o Token e Salva os dados no **MySQL**.

Essa arquitetura é segura, escalável e aproveita o melhor dos dois mundos: a agilidade do Supabase e o custo-benefício da Hostinger.
