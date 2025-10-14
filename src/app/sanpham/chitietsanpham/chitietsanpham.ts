import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DangKyLaiThuComponent } from '../dangkylaithu/dangkylaithu';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './chitietsanpham.html',
  styleUrls: ['./chitietsanpham.css'],
  imports: [DecimalPipe, CommonModule, FormsModule, DangKyLaiThuComponent],
})
export class Chitietsanpham implements OnInit {
  product: any = null; // Sản phẩm chính
  details: any = null; // Chi tiết kỹ thuật
  thumbnails: string[] = []; // Ảnh phụ
  selectedImage: string = '';
  formMessage: string | null = null;
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
    if (typeof window !== 'undefined') {
      window.scroll(0, 0);
    }
  }

  // Lấy chi tiết sản phẩm
  loadProduct(id: string) {
    this.http.get(`http://localhost/shop_car/api/chitietsanpham.php?id=${id}`).subscribe({
      next: (data: any) => {
        // Lấy toàn bộ product
        this.product = data;

        // Chi tiết kỹ thuật (có thể null)
        this.details = data.details || null;

        // Danh sách ảnh phụ
        if (data.images && data.images.length > 0) {
          this.thumbnails = data.images.map((img: string) => this.getImageUrl(img));
        } else {
          this.thumbnails = [this.getImageUrl(data.image_url)];
        }

        // Ảnh chính mặc định
        this.selectedImage =
          this.thumbnails.length > 0
            ? this.thumbnails[0]
            : 'image/2B145FE80DA2EB1E130C8767B693D021.png';

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
      },
    });
  }

  // Hàm lấy URL ảnh
  getImageUrl(img: string): string {
    if (!img) return 'image/2B145FE80DA2EB1E130C8767B693D021.png';
    return `${img}`;
  }

  // Thay đổi ảnh chính
  changeMainImage(img: string) {
    this.selectedImage = img;
  }

  // Gửi form đăng ký lái thử
  submitForm(event: Event) {
    event.preventDefault();
    this.formMessage = null;
    this.isSuccess = false;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    this.http.post('http://localhost/shop_car/api/dang-ky-lai-thu.php', formData).subscribe({
      next: (res: any) => {
        this.formMessage = 'Đăng ký lái thử thành công!';
        this.isSuccess = true;
        form.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.formMessage = 'Đăng ký thất bại, vui lòng thử lại!';
        this.isSuccess = false;
        this.cdr.detectChanges();
      },
    });
  }
  addToCart(product: any) {
    // Gọi phương thức đã định nghĩa sẵn trong AuthService để nó lo việc lưu local,
    // cập nhật BehaviorSubject (thông báo cho các components khác) và đồng bộ server.
    this.authService.addToCart(product);
    alert('Sản phẩm đã được thêm vào giỏ hàng!');
  }
}
