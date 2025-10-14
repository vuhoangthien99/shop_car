<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Chặn preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db_connect.php'; // Kết nối $pdo

// ---------------------- GET chi tiết sản phẩm ----------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['product_id'])) {
    $product_id = intval($_GET['product_id']);

    // Lấy details
    $stmt = $pdo->prepare("SELECT * FROM product_details WHERE product_id = :product_id");
    $stmt->execute([':product_id' => $product_id]);
    $details = $stmt->fetch(PDO::FETCH_ASSOC);

    // Lấy images
    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = :product_id ORDER BY is_main DESC, id ASC");
    $stmt->execute([':product_id' => $product_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['details' => $details ?: null, 'images' => $images]);
    exit;
}

// ---------------------- PUT cập nhật chi tiết ----------------------
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data['product_id']) {
        http_response_code(400);
        echo json_encode(['message' => 'product_id bắt buộc']);
        exit;
    }

    $fields = [
        'dong_co',
        'hop_so',
        'dung_tich_xi_lanh',
        'dai_rong_cao',
        'chieu_dai_co_so',
        'khoang_sang_gam_xe',
        'tieu_thu_tong_hop',
        'tieu_thu_do_thi',
        'tieu_thu_ngoai_do_thi'
    ];

    $set = [];
    $params = [':product_id' => $data['product_id']];
    foreach ($fields as $f) {
        if (isset($data[$f])) {
            $set[] = "$f = :$f";
            $params[":$f"] = $data[$f];
        }
    }

    if (isset($data['id'])) {
        // UPDATE
        $sql = "UPDATE product_details SET " . implode(', ', $set) . " WHERE id = :id";
        $params[':id'] = $data['id'];
    } else {
        // INSERT mới
        $sql = "INSERT INTO product_details (product_id," . implode(',', $fields) . ") VALUES (:product_id," . implode(',', array_map(fn($f) => ":$f", $fields)) . ")";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['message' => 'Cập nhật chi tiết sản phẩm thành công']);
    exit;
}

// ---------------------- POST thêm hình ảnh ----------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['type']) && $_GET['type'] === 'image') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data['product_id'] || !$data['image_url']) {
        http_response_code(400);
        echo json_encode(['message' => 'product_id và image_url là bắt buộc']);
        exit;
    }

    // Nếu is_main=1, reset tất cả main cũ
    if (isset($data['is_main']) && $data['is_main'] == 1) {
        $stmt = $pdo->prepare("UPDATE product_images SET is_main=0 WHERE product_id=:product_id");
        $stmt->execute([':product_id' => $data['product_id']]);
    }

    $stmt = $pdo->prepare("INSERT INTO product_images (product_id,image_url,is_main) VALUES (:product_id,:image_url,:is_main)");
    $stmt->execute([
        ':product_id' => $data['product_id'],
        ':image_url' => $data['image_url'],
        ':is_main' => $data['is_main'] ?? 0
    ]);

    echo json_encode(['message' => 'Thêm hình ảnh thành công', 'id' => $pdo->lastInsertId()]);
    exit;
}

// ---------------------- DELETE hình ảnh ----------------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['image_id'])) {
    $image_id = intval($_GET['image_id']);
    $stmt = $pdo->prepare("DELETE FROM product_images WHERE id=:id");
    $stmt->execute([':id' => $image_id]);

    echo json_encode(['message' => 'Xóa hình ảnh thành công']);
    exit;
}

// ---------------------- Nếu request không hợp lệ ----------------------
http_response_code(400);
echo json_encode(['message' => 'Request không hợp lệ']);
