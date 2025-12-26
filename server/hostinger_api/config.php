<?php
// config.php - Configurações centrais

// 1. Configurações do Banco de Dados MySQL (Hostinger)
// PREENCHA COM SEUS DADOS REAIS
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_vitrinex');
define('DB_USER', 'u123456789_admin');
define('DB_PASS', 'SuaSenhaForteAqui');

// 2. Configurações do Supabase (Para validação do Token)
// Pegue o "JWT Secret" em Settings > API no painel do Supabase
define('SUPABASE_JWT_SECRET', 'sua-jwt-secret-do-supabase-aqui');

// Função de Conexão PDO
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro de conexão com o banco de dados"]);
        exit;
    }
}
?>
