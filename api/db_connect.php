<?php
$host = "localhost";
$db_name = "car_shop_db";
$username = "root";
$password = "";

try {
    // Kết nối PDO (chuẩn hiện đại, dùng cho API Angular hoặc PHP mới)
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Giữ tương thích với code cũ dùng mysqli hoặc $conn
    $conn = new mysqli($host, $username, $password, $db_name);
    if ($conn->connect_error) {
        throw new Exception("Lỗi kết nối MySQLi: " . $conn->connect_error);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("Database connection error: " . $e->getMessage());
    echo json_encode(["message" => "Lỗi máy chủ: Không thể kết nối cơ sở dữ liệu."]);
    exit();
}
?>