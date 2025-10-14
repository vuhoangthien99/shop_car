<?php
// checkout.php

// BẬT DEBUG
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php'; // Đảm bảo bạn có file kết nối CSDL này
global $pdo;

$data = json_decode(file_get_contents("php://input"), true);

// Dữ liệu bắt buộc từ client
$user_id = $data['user_id'] ?? null;
$total_amount = $data['total_amount'] ?? null;
$items = $data['items'] ?? []; // Danh sách sản phẩm đã chọn từ giỏ hàng
$payment_method = $data['payment_method'] ?? 'cash'; 

if (!$user_id || !$total_amount || empty($items)) {
    http_response_code(400);
    echo json_encode(["message" => "Dữ liệu checkout không hợp lệ: user_id, total_amount và items là bắt buộc."]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. TẠO BẢN GHI TRONG BẢNG ORDERS
    $sql_order = "INSERT INTO orders (user_id, total_amount, status) VALUES (:user_id, :total_amount, 'pending')";
    $stmt_order = $pdo->prepare($sql_order);
    $stmt_order->execute([
        ':user_id' => $user_id,
        ':total_amount' => $total_amount
    ]);
    $order_id = $pdo->lastInsertId();

    // 2. TẠO BẢN GHI TRONG BẢNG ORDER_ITEMS
    $sql_item = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:order_id, :product_id, :quantity, :price)";
    $stmt_item = $pdo->prepare($sql_item);

    foreach ($items as $item) {
        $stmt_item->execute([
            ':order_id' => $order_id,
            ':product_id' => $item['id'],
            ':quantity' => $item['quantity'],
            ':price' => $item['price'] // Sử dụng giá tại thời điểm đặt hàng
        ]);
    }

    // 3. TẠO BẢN GHI TRONG BẢNG PAYMENTS (Khởi tạo trạng thái thanh toán)
    $sql_payment = "INSERT INTO payments (order_id, payment_method, amount, status) VALUES (:order_id, :payment_method, :amount, 'pending')";
    $stmt_payment = $pdo->prepare($sql_payment);
    $stmt_payment->execute([
        ':order_id' => $order_id,
        ':payment_method' => $payment_method,
        ':amount' => $total_amount
    ]);
    
    // Ghi log hoạt động (Tùy chọn)
    // $sql_confirmation = "INSERT INTO order_confirmations (order_id, confirmation_status, note) VALUES (:order_id, 'pending', 'Đơn hàng mới được tạo')";
    // $pdo->prepare($sql_confirmation)->execute([':order_id' => $order_id]);

    $pdo->commit();
    http_response_code(201);
    echo json_encode([
        "message" => "Đơn hàng đã được tạo thành công.", 
        "order_id" => $order_id
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("Lỗi tạo đơn hàng: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ khi tạo đơn hàng: " . $e->getMessage()]);
}
?>