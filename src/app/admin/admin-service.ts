// admin-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- ORDER STATUS TYPE ---
// Định nghĩa các trạng thái đơn hàng cố định
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'returned';

// --- USERS INTERFACE ---
export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  password?: string;
}

// --- PRODUCTS INTERFACE ---
export interface Product {
  id?: number;
  name: string;
  category_id: number;
  price: number;
  stock: number;
  image_url: string;
  img_hover: string;
  so_cho_ngoi: string;
  kieu_dang: string;
  nhien_lieu: string;
  xuat_xu: string;
  loai_xe: string;
  description: string;
  status: 'active' | 'inactive';
}

// --- ORDERS INTERFACES ---
export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  total_amount: number;
  status: OrderStatus;
  order_date: string;
}

export interface OrderDetail {
  id: number; // Order Item ID
  product_id: number;
  quantity: number;
  price_at_order: number;
  subtotal: number; 
  product_name: string;
  image_url: string;
}

export interface DetailedOrder extends Order {
  email: string;
  details: OrderDetail[];
}

// --- PRODUCT ATTRIBUTES INTERFACES ---
export interface ProductDetail {
  id?: number;
  product_id: number;
  dong_co: string;
  hop_so: string;
  dung_tich_xi_lanh: string;
  dai_rong_cao: string;
  chieu_dai_co_so: string;
  khoang_sang_gam_xe: string;
  tieu_thu_tong_hop: string;
  tieu_thu_do_thi: string;
  tieu_thu_ngoai_do_thi: string;
}

export interface ProductImage {
  id?: number;
  product_id: number;
  image_url: string;
  is_main: 0 | 1;
}

export interface ProductAttributes {
  details: ProductDetail | null;
  images: ProductImage[];
}

// --- TEST DRIVE ---
export interface TestDrive {
  id: number;
  product_name: string;
  product_image: string;
  fullname: string;
  phone: string;
  city: string;
  dealer: string;
  date_schedule: string;
  has_license: number;
  agree_info: number;
  policy_agreed: number;
  created_at: string;
  status: string;
}

// --------------------------------------------------

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost/shop_car/api/';
  private productAttrUrl = this.apiUrl + 'product_attributes.php';

  constructor(private http: HttpClient) {}

  // --- USERS ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + 'users.php');
  }
  addUser(user: User): Observable<any> {
    return this.http.post(this.apiUrl + 'users.php', user);
  }
  updateUser(user: User): Observable<any> {
    return this.http.put(this.apiUrl + 'users.php', user);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'users.php', { body: { id: id } });
  }

  // --- PRODUCTS ---
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl + 'products.php');
  }
  getProductDetail(id: number): Observable<Product> {
    return this.http.get<Product>(this.apiUrl + 'products.php?id=' + id);
  }
  addProduct(product: Product): Observable<any> {
    return this.http.post(this.apiUrl + 'products.php', product);
  }
  updateProduct(product: Product): Observable<any> {
    return this.http.put(this.apiUrl + 'products.php', product);
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'products.php', { body: { id: id } });
  }

  // --- ORDERS ---
  // Lấy tất cả đơn hàng (cho Admin)
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl + 'orders.php');
  }
  // Lấy chi tiết đơn hàng
  getOrderDetail(id: number): Observable<DetailedOrder> {
    return this.http.get<DetailedOrder>(this.apiUrl + 'orders.php?id=' + id);
  }
  // Lấy đơn hàng theo User ID (cho MyOrders)
  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}orders.php?user_id=${userId}`);
  }
  // Cập nhật trạng thái đơn hàng (cho Admin)
  updateOrderStatus(id: number, status: OrderStatus, adminId: number): Observable<any> {
    return this.http.put(this.apiUrl + 'orders.php', {
      id,
      status,
      confirmed_by: adminId, // Truyền ID Admin lên API
    });
  }

  // --- PRODUCT ATTRIBUTES (DETAILS & IMAGES) ---
  getProductAttributes(productId: number): Observable<ProductAttributes> {
    return this.http.get<ProductAttributes>(this.productAttrUrl + `?product_id=${productId}`);
  }
  saveProductDetails(details: ProductDetail): Observable<any> {
    return this.http.put(this.productAttrUrl, details);
  }
  addImage(image: ProductImage): Observable<any> {
    return this.http.post(this.productAttrUrl + '?type=image', image);
  }
  deleteImage(id: number): Observable<any> {
    return this.http.delete(this.productAttrUrl + '?type=image', { body: { id: id } });
  }

  // --- TEST DRIVE ---
  getTestDriveList(): Observable<TestDrive[]> {
    return this.http.get<TestDrive[]>(`${this.apiUrl}get_test_drive_list.php`);
  }

  updateTestDriveStatus(id: number, status: string) {
    return this.http.post(`${this.apiUrl}update_test_drive_status.php`, { id, status });
  }

  deleteTestDrive(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete_test_drive.php`, { id });
  }
}
