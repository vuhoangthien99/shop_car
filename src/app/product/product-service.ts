import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// ĐỊNH NGHĨA INTERFACE DỮ LIỆU KHỚP VỚI PHP
export interface Product {
  id: number;
  ten_xe: string;
  gia: number;
  image_file: string; // Tên file ảnh (ví dụ: 'xe1.jpg')
  img_hover_file: string;
  mo_ta_chi_tiet: string; // Dùng trường description
  loai_xe: string; // Tên Category (ví dụ: 'Số tự động')
  so_cho_ngoi: string; // Giả định (ví dụ: '7 chỗ')
  kieu_dang: string; // Giả định (ví dụ: 'Đa dạng')
  nhien_lieu: string; // Giả định (ví dụ: 'Số tự động vô cấp')
  xuat_xu: string; // Giả định (ví dụ: 'Indonesia')
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // **ĐIỀN ĐÚNG URL TRỎ ĐẾN FILE PHP CỦA BẠN**
  private readonly apiUrl = 'http://localhost/shop_car/api/get_products.php';

  constructor(private http: HttpClient) {}

  // Phương thức GET để lấy danh sách sản phẩm
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}
