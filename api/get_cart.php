<?php
// get_cart.php

// BẬT DEBUG: HIỂN THỊ TẤT CẢ LỖI (Nên xóa khi deploy Production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';
global $pdo;

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "user_id là bắt buộc"]);
    exit();
}

try {
    // 1. Tìm Cart ID
    $stmt_cart = $pdo->prepare("SELECT id FROM cart WHERE user_id = :user_id");
    $stmt_cart->execute([':user_id' => $user_id]);
    $cart_id = $stmt_cart->fetchColumn();

    $cart_items = [];
    if ($cart_id) {
        // 2. Lấy thông tin chi tiết các mục trong giỏ hàng
        // Đã sửa tên bảng: FROM cart_items ci
        $sql = "
            SELECT 
                ci.product_id AS id, 
                ci.quantity, 
                ci.price,
                p.name,
                p.image_url
            FROM 
                cart_items ci
            JOIN 
                products p ON ci.product_id = p.id
            WHERE 
                ci.cart_id = :cart_id
        ";
        $stmt_items = $pdo->prepare($sql);
        $stmt_items->execute([':cart_id' => $cart_id]);
        $cart_items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);
    }

    // Trả về mảng rỗng nếu không có giỏ hàng, hoặc mảng sản phẩm
    echo json_encode($cart_items);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Lỗi tải giỏ hàng: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ khi tải giỏ hàng: " . $e->getMessage()]);
}
?>