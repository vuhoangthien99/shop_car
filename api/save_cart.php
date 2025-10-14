<?php
// save_cart.php

// BẬT DEBUG: HIỂN THỊ TẤT CẢ LỖI (Nên xóa khi deploy Production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';
global $pdo;

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$items = $data['items'] ?? [];

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "user_id là bắt buộc"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Tìm hoặc tạo Cart (Giỏ hàng)
    $stmt = $pdo->prepare("SELECT id FROM cart WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $user_id]);
    $cart_id = $stmt->fetchColumn();

    if (!$cart_id) {
        $stmt = $pdo->prepare("INSERT INTO cart (user_id) VALUES (:user_id)");
        $stmt->execute([':user_id' => $user_id]);
        $cart_id = $pdo->lastInsertId();
    }

    // 2. Xóa các mục Cart_Items cũ
    // Đã sửa tên bảng: DELETE FROM cart_items
    $pdo->prepare("DELETE FROM cart_items WHERE cart_id = :cart_id")->execute([':cart_id' => $cart_id]);

    // 3. Thêm các mục Cart_Items mới
    if (!empty($items)) {
        // Đã sửa tên bảng: INSERT INTO cart_items
        $sql = "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (:cart_id, :product_id, :quantity, :price)";
        $stmt_insert = $pdo->prepare($sql);

        foreach ($items as $item) {
            $stmt_insert->execute([
                ':cart_id' => $cart_id,
                ':product_id' => $item['id'], 
                ':quantity' => $item['quantity'],
                ':price' => $item['price'] 
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(["message" => "Đồng bộ giỏ hàng thành công", "cart_id" => $cart_id]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("Lỗi đồng bộ giỏ hàng: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ khi đồng bộ giỏ hàng: " . $e->getMessage()]);
}
?>