<?php
// Arquivo: public_html/api/registrar_treino.php

// Liberal geral para seu app acessar de qualquer lugar
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

include_once 'db_connect.php';

// Recebe os dados
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->prompt) && !empty($data->resposta)) {
    
    // Define valores pradrão se faltar algo
    $sessao = $data->session_id ?? 'anonimo';
    $acao = $data->tipo_acao ?? 'geral';
    $final = $data->versao_final ?? null;

    $sql = "INSERT INTO dataset_treinamento 
            (session_id, tipo_acao, prompt_usuario, resposta_ia, versao_final_usuario)
            VALUES (:sessao, :acao, :prompt, :resp, :final)";
            
    $stmt = $conn->prepare($sql);
    
    $stmt->bindParam(":sessao", $sessao);
    $stmt->bindParam(":acao", $acao);
    $stmt->bindParam(":prompt", $data->prompt);
    $stmt->bindParam(":resp", $data->resposta);
    $stmt->bindParam(":final", $final);

    if($stmt->execute()){
        echo json_encode(["status" => "sucesso"]);
    } else {
        echo json_encode(["status" => "erro"]);
    }
}
?>
