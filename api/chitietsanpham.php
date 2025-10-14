<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// nếu chỉ để test:
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include 'db_connect.php';

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID sản phẩm"]);
    exit;
}

$id = intval($_GET['id']);

// ✅ Lấy thông tin sản phẩm
$stmt = $pdo->prepare(query: "SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    http_response_code(404);
    echo json_encode(["message" => "Không tìm thấy sản phẩm"]);
    exit;
}
// Lấy danh sách chi tiết sản phẩm
// 3️⃣ Lấy chi tiết kỹ thuật
$stmt_detail = $pdo->prepare("SELECT * FROM product_details WHERE product_id = ?");
$stmt_detail->execute([$id]);
$detail = $stmt_detail->fetch(PDO::FETCH_ASSOC);
// ✅ Lấy danh sách ảnh từ bảng products_image
$stmt_img = $pdo->prepare("SELECT image_url FROM product_images WHERE product_id = ?");
$stmt_img->execute([$id]);
$images = $stmt_img->fetchAll(PDO::FETCH_COLUMN);

// ✅ Gộp lại dữ liệu
$product['images'] = $images;
$product['details'] = $detail;

// ✅ Xuất JSON
header('Content-Type: application/json');
echo json_encode($product, JSON_UNESCAPED_UNICODE);
?>
