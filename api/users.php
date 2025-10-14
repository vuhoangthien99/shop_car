<?php
// users.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include 'db_connect.php'; // Yêu cầu có file kết nối CSDL
global $pdo;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lấy tất cả người dùng (KHÔNG BAO GỒM password)
        $stmt = $pdo->query("SELECT id, name, email, role, created_at FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
        break;

    case 'POST':
        // Thêm người dùng mới (Password là bắt buộc và được hash)
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['name'] || !$data['email'] || !$data['password']) {
            http_response_code(400);
            echo json_encode(["message"=>"name, email và password là bắt buộc"]);
            exit();
        }

        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT); 
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
        $stmt->execute([
            ':name'=>$data['name'],
            ':email'=>$data['email'],
            ':password'=>$data['password'],
            ':role'=>$data['role'] ?? 'customer'
        ]);
        echo json_encode(["message"=>"Thêm user thành công","id"=>$pdo->lastInsertId()]);
        break;

    case 'PUT':
        // Cập nhật user - cho phép không thay đổi password nếu trường password rỗng
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['id'] || !$data['name'] || !$data['email'] || !$data['role']) { 
            http_response_code(400); 
            echo json_encode(["message"=>"ID, name, email, role là bắt buộc để cập nhật"]); 
            exit(); 
        }

        $sql = "UPDATE users SET name=:name, email=:email, role=:role";
        $params = [
            ':id'=>$data['id'],
            ':name'=>$data['name'],
            ':email'=>$data['email'],
            ':role'=>$data['role']
        ];

        // Chỉ cập nhật password nếu được cung cấp và không rỗng
        if (isset($data['password']) && !empty($data['password'])) {
            $sql .= ", password=:password";
            $params[':password'] = ($data['password']);
        }

        $sql .= " WHERE id=:id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["message"=>"Cập nhật user thành công"]);
        break;

    case 'DELETE':
        // Xóa người dùng
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['id']) { http_response_code(400); echo json_encode(["message"=>"ID bắt buộc"]); exit(); }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id=:id");
        $stmt->execute([':id'=>$data['id']]);
        echo json_encode(["message"=>"Xóa user thành công"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message"=>"Method not allowed"]);
        break;
}