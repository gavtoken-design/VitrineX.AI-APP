<?php
require_once 'config.php';

// Headers CORS para permitir requisições do seu App
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Responder imediatamente a requisições OPTIONS (Pre-flight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido"]);
    exit;
}

// 1. Autenticação (Validar Token do Supabase)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    http_response_code(401);
    echo json_encode(["erro" => "Token de autenticação não fornecido"]);
    exit;
}

// 🚨 TODO: Implementar validação real do JWT com a secret key.
// Para este exemplo inicial, vamos apenas decodificar o payload (parte do meio) para pegar o ID.
// Em produção, use uma lib como firebase/php-jwt para verificar a assinatura!
try {
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) throw new Exception("Token formato inválido");
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
    
    if (!$payload || !isset($payload['sub'])) {
        throw new Exception("Payload do token inválido");
    }
    
    $userId = $payload['sub']; // O ID do usuário no Supabase
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["erro" => "Token inválido: " . $e->getMessage()]);
    exit;
}

// 2. Receber e Validar Dados
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->prompt) || !isset($data->response)) {
    http_response_code(400);
    echo json_encode(["erro" => "Dados incompletos. 'prompt' e 'response' são obrigatórios."]);
    exit;
}

// 3. Salvar no Banco
try {
    $conn = getDbConnection();
    
    // Opcional: Garantir que o usuário existe na tabela local
    /*
    $stmtUser = $conn->prepare("INSERT IGNORE INTO app_users (supabase_uuid, email) VALUES (?, ?)");
    $stmtUser->execute([$userId, $payload['email'] ?? 'unknown']);
    */

    $stmt = $conn->prepare("INSERT INTO ia_memory_logs (user_id, prompt, response, module) VALUES (:uid, :p, :r, :m)");
    
    $module = isset($data->module) ? $data->module : 'general';
    
    $stmt->execute([
        ':uid' => $userId,
        ':p' => $data->prompt,
        ':r' => $data->response,
        ':m' => $module
    ]);

    echo json_encode([
        "status" => "sucesso", 
        "mensagem" => "Memória salva com sucesso",
        "id" => $conn->lastInsertId()
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao salvar no banco: " . $e->getMessage()]);
}
?>
