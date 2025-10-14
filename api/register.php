<?php
// Thiết lập CORS và Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý yêu cầu OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();                 
}

include 'db_connect.php'; 
global $pdo;

$data = json_decode(file_get_contents("php://input"));

// 1. Kiểm tra dữ liệu đầu vào
if (empty($data->name) || empty($data->email) || empty($data->password)) {
    http_response_code(400); 
    echo json_encode(["message" => "Vui lòng điền đầy đủ thông tin."]);
    exit();
}

$name = trim($data->name);
$email = trim($data->email);
$password = $data->password; 
$role = 'customer'; // Mặc định là khách hàng

// 2. Kiểm tra Email đã tồn tại chưa
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);

if ($stmt->fetch(PDO::FETCH_ASSOC)) {
    http_response_code(409); // Conflict
    echo json_encode(["message" => "Email đã tồn tại. Vui lòng sử dụng email khác."]);
    exit();
}

// 3. Mã hóa mật khẩu và chèn người dùng
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $password,
        ':role' => $role
    ]);

    http_response_code(201); // Created
    echo json_encode([
        "message" => "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
        "user_id" => $pdo->lastInsertId()
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Registration failed: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ trong quá trình đăng ký."]);
}

// KHÔNG CÓ THẺ ĐÓNG ?>