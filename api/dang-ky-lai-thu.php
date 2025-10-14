<?php
// Cho phép Angular gọi từ bất kỳ domain nào
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Nếu là preflight request (OPTIONS), trả về 200 và exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
include 'db_connect.php';

// Nhận JSON từ Angular
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["message" => "Dữ liệu không hợp lệ"]);
    exit();
}

// Kiểm tra các trường bắt buộc
$required = ['product_name', 'fullname', 'phone', 'city', 'dealer', 'policy_agreed'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        http_response_code(400);
        echo json_encode(["message" => "Thiếu trường: $field"]);
        exit();
    }
}

try {
    $sql = "INSERT INTO test_drive_registration
        (product_name, product_image, fullname, phone, city, dealer, date_schedule, has_license, agree_info, policy_agreed)
        VALUES (:product_name, :product_image, :fullname, :phone, :city, :dealer, :date_schedule, :has_license, :agree_info, :policy_agreed)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':product_name' => $data['product_name'],
        ':product_image' => $data['product_image'] ?? null,
        ':fullname' => $data['fullname'],
        ':phone' => $data['phone'],
        ':city' => $data['city'],
        ':dealer' => $data['dealer'],
        ':date_schedule' => $data['date_schedule'] ?? null,
        ':has_license' => !empty($data['has_license']) ? 1 : 0,
        ':agree_info' => !empty($data['agree_info']) ? 1 : 0,
        ':policy_agreed' => !empty($data['policy_agreed']) ? 1 : 0
    ]);
    echo json_encode(["message" => "Đăng ký lái thử thành công"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi máy chủ: " . $e->getMessage()]);
}
?>