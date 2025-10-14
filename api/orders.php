<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// Đảm bảo file db_connect.php tồn tại và kết nối PDO được gán vào $pdo
include 'db_connect.php'; 
global $pdo;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $order_id = $_GET['id'] ?? null;
        $user_id_filter = $_GET['user_id'] ?? null;

        try {
            if ($order_id) {
                // --- 1. LẤY CHI TIẾT ĐƠN HÀNG CỤ THỂ ---
                $stmt = $pdo->prepare("
                    SELECT 
                        o.id AS order_id, o.user_id, o.total_amount, o.status, o.order_date,
                        u.name AS user_name, u.email AS user_email,
                        oi.product_id, oi.quantity, oi.price_at_order AS item_price,
                        p.name AS product_name, p.image_url
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    JOIN order_items oi ON o.id = oi.order_id
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE o.id = :order_id
                ");
                $stmt->execute([':order_id' => $order_id]);
                $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($details)) { 
                    http_response_code(404); 
                    echo json_encode(["message" => "Không tìm thấy đơn hàng."]); 
                    exit(); 
                }

                // Tái cấu trúc dữ liệu thành JSON lồng nhau cho Angular
                $order = [
                    'id' => $details[0]['order_id'],
                    'user_id' => $details[0]['user_id'],
                    'user_name' => $details[0]['user_name'],
                    'user_email' => $details[0]['user_email'],
                    'total_amount' => (float)$details[0]['total_amount'],
                    'status' => $details[0]['status'],
                    'order_date' => $details[0]['order_date'],
                    'details' => [] // Tên mảng chi tiết phải là 'details'
                ];
                
                foreach ($details as $row) {
                    $order['details'][] = [
                        'id' => $row['product_id'] ?? null, 
                        'product_id' => $row['product_id'] ?? null,
                        'product_name' => $row['product_name'] ?? 'Sản phẩm đã xóa', 
                        'quantity' => (int)$row['quantity'],
                        'price_at_order' => (float)$row['item_price'], // Giá cố định tại thời điểm đặt
                        'image_url' => $row['image_url'] ?? 'default.png'
                    ];
                }
                echo json_encode($order);
                
            } elseif ($user_id_filter) {
                // --- 2. LẤY DANH SÁCH ĐƠN HÀNG THEO USER ID (Cho User My Orders) ---
                $stmt = $pdo->prepare("
                    SELECT o.id, o.total_amount, o.status, o.order_date
                    FROM orders o
                    WHERE o.user_id = :user_id
                    ORDER BY o.order_date DESC
                ");
                $stmt->execute([':user_id' => $user_id_filter]);
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($orders);

            } else {
                // --- 3. LẤY DANH SÁCH TẤT CẢ ĐƠN HÀNG (Cho Admin Dashboard) ---
                $stmt = $pdo->query("
                    SELECT o.id, u.name as user_name, o.total_amount, o.status, o.order_date
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    ORDER BY o.order_date DESC
                ");
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($orders);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Lỗi truy vấn CSDL: " . $e->getMessage());
            echo json_encode(["message" => "Lỗi truy vấn CSDL: " . $e->getMessage()]); // Trả lỗi chi tiết
        }
        break;

    case 'POST':
        // Cần đảm bảo logic POST (tạo đơn hàng) cũng insert vào order_items
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['user_id'] || !$data['total_amount'] || !isset($data['items'])) {
            http_response_code(400);
            echo json_encode(["message" => "user_id, total_amount và items là bắt buộc"]);
            exit();
        }

        try {
            $pdo->beginTransaction();
            
            // 1. Thêm vào bảng orders
            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (:user_id, :total_amount, :status)");
            $stmt->execute([
                ':user_id' => $data['user_id'],
                ':total_amount' => $data['total_amount'],
                ':status' => $data['status'] ?? 'pending'
            ]);
            $order_id = $pdo->lastInsertId();

            // 2. Thêm vào bảng order_items
            $stmt_item = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_order) VALUES (:order_id, :product_id, :quantity, :price_at_order)");
            
            foreach ($data['items'] as $item) {
                // Lấy giá hiện tại của sản phẩm để lưu lại (price_at_order)
                $stmt_price = $pdo->prepare("SELECT price FROM products WHERE id = :product_id");
                $stmt_price->execute([':product_id' => $item['product_id']]);
                $price_at_order = $stmt_price->fetchColumn();

                if (!$price_at_order) {
                    throw new Exception("Không tìm thấy giá cho product_id: " . $item['product_id']);
                }

                $stmt_item->execute([
                    ':order_id' => $order_id,
                    ':product_id' => $item['product_id'],
                    ':quantity' => $item['quantity'],
                    ':price_at_order' => $price_at_order 
                ]);
            }
            
            $pdo->commit();
            echo json_encode(["message"=>"Thêm đơn hàng và chi tiết thành công","id"=>$order_id]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            error_log("Lỗi tạo đơn hàng: " . $e->getMessage());
            echo json_encode(["message" => "Lỗi hệ thống khi tạo đơn hàng: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Logic PUT để cập nhật trạng thái đơn hàng (dùng cho Admin)
        $data = json_decode(file_get_contents("php://input"), true);
        $order_id = $data['id'] ?? null;
        $new_status = $data['status'] ?? null;
        $confirmed_by = $data['confirmed_by'] ?? null; 

        if (!$order_id || !$new_status) { 
            http_response_code(400); 
            echo json_encode(["message"=>"ID và trạng thái đơn hàng mới là bắt buộc."]); 
            exit(); 
        }

        try {
            $sql = "UPDATE orders SET status = :status";
            $params = [':id' => $order_id, ':status' => $new_status];

            // Nếu bạn có cột confirmed_by trong bảng orders, hãy sử dụng:
            /*
            if (isset($data['confirmed_by'])) {
                $sql .= ", confirmed_by = :confirmed_by";
                $params[':confirmed_by'] = $confirmed_by;
            }
            */

            $sql .= " WHERE id = :id";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(["message" => "Cập nhật trạng thái đơn hàng thành công", "new_status" => $new_status]);

        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Lỗi cập nhật đơn hàng: " . $e->getMessage());
            echo json_encode(["message" => "Lỗi máy chủ khi cập nhật đơn hàng."]);
        }
        break;

    case 'DELETE':
        // Xóa đơn hàng và order_items liên quan (sử dụng DELETE CASCADE trên order_items_ibfk_1)
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['id']) { http_response_code(400); echo json_encode(["message"=>"ID bắt buộc"]); exit(); }

        try {
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id=:id");
            $stmt->execute([':id'=>$data['id']]);
            echo json_encode(["message"=>"Xóa đơn hàng và chi tiết liên quan thành công"]);
        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Lỗi xóa đơn hàng: " . $e->getMessage());
            echo json_encode(["message" => "Lỗi máy chủ khi xóa đơn hàng."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>