<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS')
    exit();

$conn = new mysqli("localhost", "root", "", "car_shop_db");
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$sql = "SELECT 
            p.id, 
            p.name AS ten_xe, 
            p.price AS gia, 
            p.image_url AS image_file,
            p.img_hover AS img_hover_file,
            p.description AS mo_ta_chi_tiet,
            c.name AS loai_xe,
            p.so_cho_ngoi AS so_cho_ngoi, 
            p.kieu_dang AS kieu_dang,
            p.nhien_lieu AS nhien_lieu,
            p.xuat_xu AS xuat_xu
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'";

$result = $conn->query($sql);
$products = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>