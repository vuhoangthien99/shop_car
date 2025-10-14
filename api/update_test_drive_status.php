<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['status'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Thiếu dữ liệu đầu vào (id hoặc status).'
    ]);
    exit;
}

$id = intval($data['id']);
$status = trim($data['status']);

// ✅ Danh sách trạng thái hợp lệ (tương ứng ENUM)
$valid_statuses = ['pending', 'approved', 'test_completed', 'rejected'];
if (!in_array($status, $valid_statuses)) {
    echo json_encode([
        'success' => false,
        'message' => 'Trạng thái không hợp lệ.'
    ]);
    exit;
}

// ✅ Kiểm tra tồn tại
$check = $conn->prepare("SELECT id FROM test_drive_registration WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Không tìm thấy bản ghi trong cơ sở dữ liệu.'
    ]);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// ✅ Cập nhật trạng thái
$stmt = $conn->prepare("UPDATE test_drive_registration SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => '✅ Cập nhật trạng thái lái thử thành công.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '❌ Lỗi khi cập nhật: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
