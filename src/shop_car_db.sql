-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for car_shop_db
CREATE DATABASE IF NOT EXISTS `car_shop_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `car_shop_db`;

-- Dumping structure for table car_shop_db.cart
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.cart: ~1 rows (approximately)
REPLACE INTO `cart` (`id`, `user_id`, `created_at`) VALUES
	(6, 1, '2025-10-10 17:47:17');

-- Dumping structure for table car_shop_db.cart_items
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.cart_items: ~0 rows (approximately)
REPLACE INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `price`) VALUES
	(66, 6, 2, 2, 56000000.00);

-- Dumping structure for table car_shop_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `parent_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.categories: ~5 rows (approximately)
REPLACE INTO `categories` (`id`, `name`, `description`, `parent_id`, `created_at`, `updated_at`) VALUES
	(1, 'Sedan', NULL, NULL, '2025-10-09 17:44:15', '2025-10-09 17:44:15'),
	(2, 'SUV', NULL, NULL, '2025-10-09 17:44:15', '2025-10-09 17:44:15'),
	(3, 'Hatchback', NULL, NULL, '2025-10-09 17:44:15', '2025-10-09 17:44:15'),
	(4, 'Pickup', NULL, NULL, '2025-10-09 17:44:15', '2025-10-09 17:44:15'),
	(5, 'MPV', NULL, NULL, '2025-10-09 17:44:15', '2025-10-09 17:44:15');

-- Dumping structure for table car_shop_db.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_amount` bigint NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','returned') DEFAULT 'pending',
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.orders: ~6 rows (approximately)
REPLACE INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `order_date`) VALUES
	(1, 2, 56000000, 'confirmed', '2025-10-10 17:11:44'),
	(2, 2, 56000000, 'pending', '2025-10-10 19:27:06'),
	(3, 2, 56000000, 'pending', '2025-10-10 20:02:23'),
	(7, 2, 65000000, 'pending', '2025-10-10 20:37:42'),
	(8, 2, 143900000, 'pending', '2025-10-10 20:40:39'),
	(9, 2, 112000000, 'pending', '2025-10-11 07:05:54'),
	(10, 2, 168000000, 'pending', '2025-10-11 07:22:24'),
	(11, 2, 56000000, 'pending', '2025-10-11 07:22:49');

-- Dumping structure for table car_shop_db.order_confirmations
CREATE TABLE IF NOT EXISTS `order_confirmations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `confirmed_by` int DEFAULT NULL,
  `confirmation_status` enum('confirmed','rejected') DEFAULT 'confirmed',
  `note` text,
  `confirmed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `confirmed_by` (`confirmed_by`),
  CONSTRAINT `order_confirmations_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_confirmations_ibfk_2` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.order_confirmations: ~1 rows (approximately)
REPLACE INTO `order_confirmations` (`id`, `order_id`, `confirmed_by`, `confirmation_status`, `note`, `confirmed_at`) VALUES
	(1, 1, 1, 'confirmed', 'Cập nhật trạng thái bởi Admin.', '2025-10-10 17:47:29');

-- Dumping structure for table car_shop_db.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) DEFAULT NULL,
  `price_at_order` decimal(10,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm đặt hàng',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.order_items: ~3 rows (approximately)
REPLACE INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `price_at_order`) VALUES
	(1, 1, 2, 1, 56000000.00, 0.00),
	(2, 2, 2, 1, 56000000.00, 0.00),
	(3, 3, 2, 1, 56000000.00, 0.00),
	(4, 1, 1, 2, NULL, 1000000.00),
	(5, 7, 1, 1, NULL, 65000000.00),
	(6, 8, 3, 1, NULL, 87900000.00),
	(7, 8, 2, 1, NULL, 56000000.00),
	(8, 9, 2, 2, NULL, 56000000.00),
	(9, 10, 2, 3, NULL, 56000000.00),
	(10, 11, 2, 1, NULL, 56000000.00);

-- Dumping structure for table car_shop_db.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `payment_method` enum('cash','bank_transfer','credit_card') DEFAULT 'cash',
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.payments: ~3 rows (approximately)
REPLACE INTO `payments` (`id`, `order_id`, `payment_method`, `amount`, `payment_date`, `status`) VALUES
	(1, 1, 'cash', 56000000.00, '2025-10-10 17:11:44', 'pending'),
	(2, 2, 'cash', 56000000.00, '2025-10-10 19:27:06', 'pending'),
	(3, 3, 'cash', 56000000.00, '2025-10-10 20:02:23', 'pending');

-- Dumping structure for table car_shop_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category_id` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `img_hover` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `so_cho_ngoi` int DEFAULT NULL,
  `kieu_dang` varchar(255) DEFAULT NULL,
  `nhien_lieu` varchar(50) DEFAULT NULL,
  `xuat_xu` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `loai_xe` varchar(100) DEFAULT NULL,
  `mo_ta_chi_tiet` text,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.products: ~3 rows (approximately)
REPLACE INTO `products` (`id`, `name`, `category_id`, `price`, `stock`, `image_url`, `img_hover`, `description`, `status`, `created_at`, `so_cho_ngoi`, `kieu_dang`, `nhien_lieu`, `xuat_xu`, `loai_xe`, `mo_ta_chi_tiet`) VALUES
	(1, 'Honda City RS 2025', 1, 65000000.00, 10, 'image/26A81D343439965FB49A7BE7462057F9.png', 'image/91896BC2F922CCC503B527165B6C3D8F.png', 'Honda City RS thể thao, tiết kiệm nhiên liệu.', 'active', '2025-10-09 18:05:44', 5, 'Sedan', 'Xăng', 'Việt Nam', 'Xe du lịch', 'Phiên bản cao cấp RS với động cơ 1.5L DOHC i-VTEC.'),
	(2, 'Toyota Vios G 2025', 1, 56000000.00, 8, 'image/1052B1A4AE5C2C5809F65C757841A149.png', 'image/3B49A305103F09535D8827E3F32A849A.png', 'Toyota Vios G bền bỉ, tiết kiệm nhiên liệu.', 'active', '2025-10-09 18:05:44', 5, 'Sedan', 'Xăng', 'Thái Lan', 'Xe du lịch', 'Mẫu sedan phổ thông với hộp số CVT mượt mà.'),
	(3, 'Mazda CX-5 2.0L Luxury', 2, 87900000.00, 5, 'image/2B145FE80DA2EB1E130C8767B693D021.png', 'image/5188C85C5E8C813398E30D3634915D95.png', 'Mazda CX-5 phong cách, hiện đại, tiện nghi.', 'active', '2025-10-09 18:05:44', 5, 'SUV', 'Xăng', 'Nhật Bản', 'Xe SUV', 'Trang bị công nghệ an toàn i-Activsense tiên tiến.');

-- Dumping structure for table car_shop_db.product_details
CREATE TABLE IF NOT EXISTS `product_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `dong_co` varchar(50) DEFAULT NULL,
  `hop_so` varchar(20) DEFAULT NULL,
  `dung_tich_xi_lanh` varchar(10) DEFAULT NULL,
  `dai_rong_cao` varchar(50) DEFAULT NULL,
  `chieu_dai_co_so` varchar(10) DEFAULT NULL,
  `khoang_sang_gam_xe` varchar(10) DEFAULT NULL,
  `tieu_thu_tong_hop` varchar(20) DEFAULT NULL,
  `tieu_thu_do_thi` varchar(20) DEFAULT NULL,
  `tieu_thu_ngoai_do_thi` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.product_details: ~3 rows (approximately)
REPLACE INTO `product_details` (`id`, `product_id`, `dong_co`, `hop_so`, `dung_tich_xi_lanh`, `dai_rong_cao`, `chieu_dai_co_so`, `khoang_sang_gam_xe`, `tieu_thu_tong_hop`, `tieu_thu_do_thi`, `tieu_thu_ngoai_do_thi`, `created_at`, `updated_at`) VALUES
	(1, 1, '1.5L DOHC i-VTEC', 'CVT', '1498cc', '4.553 x 1.748 x 1.467 mm', '2600 mm', '134 mm', '5.68L/100km', '7.3L/100km', '4.9L/100km', '2025-10-09 18:05:52', '2025-10-09 18:05:52'),
	(2, 2, '1.5L Dual VVT-i', 'CVT', '1496cc', '4.410 x 1.700 x 1.475 mm', '2550 mm', '133 mm', '5.7L/100km', '7.5L/100km', '4.8L/100km', '2025-10-09 18:05:52', '2025-10-09 18:05:52'),
	(3, 3, '2.0L SkyActiv-G', '6AT', '1998cc', '4.550 x 1.840 x 1.680 mm', '2700 mm', '200 mm', '6.7L/100km', '8.5L/100km', '5.9L/100km', '2025-10-09 18:05:52', '2025-10-09 18:05:52');

-- Dumping structure for table car_shop_db.product_images
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.product_images: ~13 rows (approximately)
REPLACE INTO `product_images` (`id`, `product_id`, `image_url`, `is_main`, `created_at`) VALUES
	(1, 1, 'https://cdn.honda.com.vn/automobiles/November2024/Ui4X8ajPSCVMXqa1zObq.png', 1, '2025-10-09 18:06:41'),
	(2, 1, 'https://cdn.honda.com.vn/automobiles/November2024/FyXzyeEQPlNROE6PQnVz.png', 0, '2025-10-09 18:06:41'),
	(3, 1, 'https://cdn.honda.com.vn/automobiles/November2024/9VZ6bDrC8dI8cRbhKXNr.png', 0, '2025-10-09 18:06:41'),
	(4, 1, 'https://cdn.honda.com.vn/automobiles/November2024/2jQ8AxllaXUGkLAT1ysy.png', 0, '2025-10-09 18:06:41'),
	(6, 2, 'https://cdn.honda.com.vn/automobiles/April2025/xwNfpwqumzlbbjD6CsAx.png', 0, '2025-10-09 18:06:41'),
	(7, 2, 'https://cdn.honda.com.vn/automobiles/April2025/wH5pUtZi46pDz6lJJa0Z.png', 0, '2025-10-09 18:06:41'),
	(8, 2, 'https://cdn.honda.com.vn/automobiles/April2025/gCTn5dbNxW2EnyoGH8L1.png', 0, '2025-10-09 18:06:41'),
	(9, 2, 'https://cdn.honda.com.vn/automobiles/April2025/uFNkCSLV1CTqdtB7Z3ff.png', 1, '2025-10-09 18:06:41'),
	(11, 3, 'https://cdn.honda.com.vn/automobiles/October2024/fBQxNSZY71SygXe5xLe1.jpg', 1, '2025-10-09 18:06:41'),
	(12, 3, 'https://cdn.honda.com.vn/automobiles/October2024/QQyPEK7R8lQFHq4VKxhn.jpg', 0, '2025-10-09 18:06:41'),
	(13, 3, 'https://cdn.honda.com.vn/automobiles/October2024/JANtuMOmeQfIHxBXCS0a.jpg', 0, '2025-10-09 18:06:41'),
	(14, 3, 'https://cdn.honda.com.vn/automobiles/October2024/QS0dz37UKOZdwmOM1XIc.jpg', 0, '2025-10-09 18:06:41'),
	(15, 3, 'https://cdn.honda.com.vn/automobiles/October2024/kJS7ahveuYyHqmDVk2Kj.jpg', 0, '2025-10-09 18:06:41');

-- Dumping structure for table car_shop_db.test_drive_registration
CREATE TABLE IF NOT EXISTS `test_drive_registration` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `fullname` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `city` varchar(50) NOT NULL,
  `dealer` varchar(100) NOT NULL,
  `date_schedule` date DEFAULT NULL,
  `has_license` tinyint(1) DEFAULT '0',
  `agree_info` tinyint(1) DEFAULT '0',
  `policy_agreed` tinyint(1) NOT NULL,
  `status` enum('pending','approved','test_completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.test_drive_registration: ~3 rows (approximately)
REPLACE INTO `test_drive_registration` (`id`, `product_name`, `product_image`, `fullname`, `phone`, `city`, `dealer`, `date_schedule`, `has_license`, `agree_info`, `policy_agreed`, `status`, `created_at`) VALUES
	(1, 'Honda City RS 2024', 'image/26A81D343439965FB49A7BE7462057F9.png', '123123', '111', 'TP. Hồ Chí Minh', 'Đại lý A', '2025-10-04', 1, 1, 1, 'test_completed', '2025-10-09 02:09:43'),
	(2, 'Honda City RS 2024', 'image/26A81D343439965FB49A7BE7462057F9.png', '123123', '333', 'TP. Hồ Chí Minh', 'Đại lý A', '2025-10-09', 1, 1, 1, 'pending', '2025-10-09 02:10:24'),
	(3, '222', '123', 'aaa', '555', 'TP. Hồ Chí Minh', 'Đại lý A', '2025-10-11', 1, 1, 1, 'approved', '2025-10-09 07:03:07'),
	(4, 'Mazda CX-5 2.0L Luxury', 'image/2B145FE80DA2EB1E130C8767B693D021.png', 'Vũ Hoàng Thiện', '0768842263', 'TP. Hồ Chí Minh', 'Đại lý A', '2025-10-04', 1, 1, 1, 'pending', '2025-10-11 00:23:16');

-- Dumping structure for table car_shop_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table car_shop_db.users: ~2 rows (approximately)
REPLACE INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
	(1, 'chienquocsieuviet.fun', 'admin@gmail.com', '123123', 'admin', '2025-10-09 09:32:45'),
	(2, '123', '123123@gmail.com', '123123', 'customer', '2025-10-10 11:16:30');

-- Dumping structure for view car_shop_db.view_cart_total
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `view_cart_total` (
	`cart_id` INT NOT NULL,
	`customer_name` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`tong_tien` DECIMAL(42,2) NULL
) ENGINE=MyISAM;

-- Dumping structure for view car_shop_db.view_doanh_thu_ngay
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `view_doanh_thu_ngay` (
	`ngay` DATE NULL,
	`doanh_thu` DECIMAL(41,0) NULL
) ENGINE=MyISAM;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `view_cart_total`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_cart_total` AS select `c`.`id` AS `cart_id`,`u`.`name` AS `customer_name`,sum((`ci`.`quantity` * `ci`.`price`)) AS `tong_tien` from ((`cart` `c` join `users` `u` on((`u`.`id` = `c`.`user_id`))) join `cart_items` `ci` on((`ci`.`cart_id` = `c`.`id`))) group by `c`.`id`,`u`.`name`;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `view_doanh_thu_ngay`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_doanh_thu_ngay` AS select cast(`o`.`order_date` as date) AS `ngay`,sum(`o`.`total_amount`) AS `doanh_thu` from `orders` `o` where (`o`.`status` = 'completed') group by cast(`o`.`order_date` as date);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
