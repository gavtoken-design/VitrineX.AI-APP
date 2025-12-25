<?php
// Arquivo: public_html/api/db_connect.php

$host = "localhost";
$dbname = "u786088869_nuvem";    // Nome que vimos na sua imagem
$username = "u786088869_nuvem";  // Usuário que vimos na sua imagem
$password = "SUA_SENHA_AQUI";    // <--- DIGITE AQUI A SENHA QUE VOCÊ CRIOU PARA O BANCO

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erro de conexão");
}
?>
