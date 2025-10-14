<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID"]);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM test_drive_registration WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    echo json_encode(["message" => "Xóa đăng ký thành công"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi máy chủ: " . $e->getMessage()]);
}
?>
