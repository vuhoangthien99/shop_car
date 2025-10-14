<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header('Location: ../login.php');
    exit;
}

include '../db_connect.php';

// Lấy số liệu cơ bản
$total_products = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
$total_orders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$total_test_drive = $pdo->query("SELECT COUNT(*) FROM test_drive_registration")->fetchColumn();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
</head>
<body>
<h1>Chào mừng Admin</h1>
<ul>
    <li>Số sản phẩm: <?= $total_products ?></li>
    <li>Số đơn hàng: <?= $total_orders ?></li>
    <li>Số người dùng: <?= $total_users ?></li>
    <li>Số đăng ký lái thử: <?= $total_test_drive ?></li>
</ul>
<a href="products.php">Quản lý sản phẩm</a> | 
<a href="orders.php">Quản lý đơn hàng</a> | 
<a href="test_drive.php">Đăng ký lái thử</a> | 
<a href="../logout.php">Đăng xuất</a>
</body>
</html>
