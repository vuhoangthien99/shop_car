<?php
// Thiết lập CORS và Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý yêu cầu OPTIONS (Preflight) và thoát
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();                 
}

// Bao gồm file kết nối CSDL (sẽ định nghĩa biến $pdo)
include 'db_connect.php'; 
global $pdo; // Kéo biến $pdo từ db_connect.php vào scope này

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Thiếu email hoặc mật khẩu."]);
    exit();
}

$email = $data->email;
$password = $data->password; 

// --- SỬ DỤNG PDO ĐỂ TRUY VẤN ---
$sql = "SELECT id, name, email, password, role FROM users WHERE email = :email";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':email', $email);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    // So sánh mật khẩu (CSDL mẫu)
    if ($password === $row['password']) { 
        
        // Trả về thành công
        http_response_code(200);
        echo json_encode([
            "message" => "Đăng nhập thành công.",
            "user" => [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role']
            ],
            "token" => "MOCK_JWT_TOKEN_123456" 
        ]);
    } else {
        http_response_code(401); // Sai mật khẩu
        echo json_encode(["message" => "Sai mật khẩu."]);
    }
} else {
    http_response_code(404); // Email không tồn tại
    echo json_encode(["message" => "Email không tồn tại."]);
}

// KHÔNG CẦN $stmt->close() và $conn->close() với PDO

// KHÔNG CÓ THẺ ĐÓNG ?>