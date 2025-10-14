<?php
// delete_cart_item.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php';
global $pdo;

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$product_id = $data['product_id'] ?? null; // ID của sản phẩm cần xóa

if (!$user_id || !$product_id) {
    http_response_code(400);
    echo json_encode(["message" => "user_id và product_id là bắt buộc"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Tìm Cart ID
    $stmt = $pdo->prepare("SELECT id FROM cart WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $user_id]);
    $cart_id = $stmt->fetchColumn();

    if (!$cart_id) {
        // Giỏ hàng không tồn tại, coi như đã xóa thành công
        http_response_code(200);
        echo json_encode(["message" => "Không tìm thấy giỏ hàng để xóa."]);
        $pdo->commit();
        exit();
    }

    // 2. Xóa mục Cart Item
    $sql_delete = "DELETE FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
    $stmt_delete = $pdo->prepare($sql_delete);
    $stmt_delete->execute([
        ':cart_id' => $cart_id,
        ':product_id' => $product_id
    ]);

    // 3. Kiểm tra giỏ hàng có rỗng không
    $stmt_count = $pdo->prepare("SELECT COUNT(*) FROM cart_items WHERE cart_id = :cart_id");
    $stmt_count->execute([':cart_id' => $cart_id]);
    $item_count = $stmt_count->fetchColumn();

    if ($item_count == 0) {
        // Nếu rỗng, xóa luôn bản ghi cart cha
        $pdo->prepare("DELETE FROM cart WHERE id = :cart_id")->execute([':cart_id' => $cart_id]);
        $message = "Sản phẩm cuối cùng đã được xóa, giỏ hàng đã được dọn dẹp.";
    } else {
        $message = "Sản phẩm đã được xóa khỏi giỏ hàng.";
    }

    $pdo->commit();
    echo json_encode(["message" => $message]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("Lỗi xóa mục giỏ hàng: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ khi xóa mục giỏ hàng."]);
}
?>