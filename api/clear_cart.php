<?php
// clear_cart.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';
global $pdo;

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "user_id là bắt buộc"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Tìm Cart ID
    $stmt = $pdo->prepare("SELECT id FROM cart WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $user_id]);
    $cart_id = $stmt->fetchColumn();

    if ($cart_id) {
        // 2. Xóa tất cả Cart Items (Không cần, vì Foreign Key sẽ lo)
        // Dựa trên cấu trúc bảng của bạn (ON DELETE CASCADE),
        // chỉ cần xóa bản ghi cart cha, các cart_items con sẽ tự động bị xóa.
        
        // 3. Xóa bản ghi Cart cha
        $pdo->prepare("DELETE FROM cart WHERE id = :cart_id")->execute([':cart_id' => $cart_id]);
        $message = "Giỏ hàng đã được xóa thành công khỏi database.";
    } else {
         $message = "Không tìm thấy giỏ hàng của user này trong database.";
    }
    
    $pdo->commit();
    echo json_encode(["message" => $message]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("Lỗi dọn dẹp giỏ hàng: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ khi dọn dẹp giỏ hàng."]);
}
?>