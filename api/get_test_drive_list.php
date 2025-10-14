<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM test_drive_registration ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi máy chủ: " . $e->getMessage()]);
}
?>
