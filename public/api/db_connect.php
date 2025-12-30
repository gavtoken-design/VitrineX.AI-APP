<?php
// Arquivo: public_html/api/db_connect.php

$host = "localhost";
$dbname = "u786088869_nuvem";
$username = "u786088869_nuvem";
$password = "VitrineX.AI2025";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erro de conexão");
}
?>
