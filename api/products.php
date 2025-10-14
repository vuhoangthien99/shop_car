<?php
// products.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db_connect.php';
global $pdo;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Lấy chi tiết một sản phẩm
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                echo json_encode(["message" => "Không tìm thấy sản phẩm"]);
                exit();
            }
            echo json_encode($product);

        } else {
            // Lấy tất cả sản phẩm
            $stmt = $pdo->query("SELECT * FROM products");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
        break;

    case 'POST':
        // =========================================================
        // === LOGIC THÊM SẢN PHẨM MỚI (ADD PRODUCT) ===
        // =========================================================
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['name'] || !isset($data['price'])) {
            http_response_code(400);
            echo json_encode(["message" => "Tên và giá sản phẩm là bắt buộc"]);
            exit();
        }

        $sql = "INSERT INTO products (name, category_id, price, stock, image_url, img_hover, so_cho_ngoi, kieu_dang, nhien_lieu, xuat_xu, loai_xe, mo_ta_chi_tiet, description, status) 
                VALUES (:name, :category_id, :price, :stock, :image_url, :img_hover, :so_cho_ngoi, :kieu_dang, :nhien_lieu, :xuat_xu, :loai_xe, :mo_ta_chi_tiet, :description, :status)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':category_id' => $data['category_id'] ?? null,
            ':price' => $data['price'],
            ':stock' => $data['stock'] ?? 0,
            ':image_url' => $data['image_url'] ?? null,
            ':img_hover' => $data['img_hover'] ?? null,
            ':so_cho_ngoi' => $data['so_cho_ngoi'] ?? null,
            ':kieu_dang' => $data['kieu_dang'] ?? null,
            ':nhien_lieu' => $data['nhien_lieu'] ?? null,
            ':xuat_xu' => $data['xuat_xu'] ?? null,
            ':loai_xe' => $data['loai_xe'] ?? null,
            ':mo_ta_chi_tiet' => $data['mo_ta_chi_tiet'] ?? null,
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
        echo json_encode(["message" => "Thêm sản phẩm thành công", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        // Cập nhật sản phẩm
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['id']) {
            http_response_code(400);
            echo json_encode(["message" => "ID sản phẩm bắt buộc"]);
            exit();
        }

        $sql = "UPDATE products SET 
                name=:name, 
                category_id=:category_id, 
                price=:price, 
                stock=:stock, 
                image_url=:image_url, 
                img_hover=:img_hover, 
                description=:description, 
                status=:status,
                so_cho_ngoi=:so_cho_ngoi,
                kieu_dang=:kieu_dang,
                nhien_lieu=:nhien_lieu,
                xuat_xu=:xuat_xu,
                loai_xe=:loai_xe,
                mo_ta_chi_tiet=:mo_ta_chi_tiet
                WHERE id=:id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':category_id' => $data['category_id'] ?? null,
            ':price' => $data['price'],
            ':stock' => $data['stock'] ?? 0,
            ':image_url' => $data['image_url'] ?? null,
            ':img_hover' => $data['img_hover'] ?? null,
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'active',
            ':so_cho_ngoi' => $data['so_cho_ngoi'] ?? null,
            ':kieu_dang' => $data['kieu_dang'] ?? null,
            ':nhien_lieu' => $data['nhien_lieu'] ?? null,
            ':xuat_xu' => $data['xuat_xu'] ?? null,
            ':loai_xe' => $data['loai_xe'] ?? null,
            ':mo_ta_chi_tiet' => $data['mo_ta_chi_tiet'] ?? null
        ]);
        echo json_encode(["message" => "Cập nhật sản phẩm thành công"]);
        break;

    case 'DELETE':
        // Xóa sản phẩm
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data['id']) {
            http_response_code(400);
            echo json_encode(["message" => "ID sản phẩm bắt buộc"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id=:id");
        $stmt->execute([':id' => $data['id']]);
        echo json_encode(["message" => "Xóa sản phẩm thành công"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}