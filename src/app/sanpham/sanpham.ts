import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
// Đảm bảo đường dẫn này đúng với vị trí file service của bạn
import { ProductService, Product } from '../product/product-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-sanpham',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './sanpham.html',
  styleUrls: ['./sanpham.css'],
})
export class Sanpham implements OnInit {
  products: Product[] = []; // Mảng để lưu trữ dữ liệu sản phẩm
  // searching sản phẩm
  searchProduct: string = '';
  filterCategory: string = '';
  filterSeats: string = '';
  filterBody: string = '';
  filterOrigin: string = '';
  filterPrice: string = '';
  filteredProducts: Product[] = [];
  // 2. Inject ChangeDetectorRef
  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    if (typeof window !== 'undefined') {
      window.scroll(0, 0);
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data; // Dữ liệu gốc
        this.filteredProducts = data; // Hiển thị tất cả sản phẩm ngay khi load
        console.log('Sản phẩm đã load:', this.products);

        // Ép Angular cập nhật giao diện ngay lập tức
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('LỖI KẾT NỐI API PHP:', err);
      },
    });
  }

  // Hàm tiện ích để định dạng giá (VD: 1005000000 -> 1.005.000.000)
  formatPrice(price: number): string {
    if (price === undefined || price === null) return '';
    // Sử dụng toLocaleString để định dạng tiền tệ Việt Nam
    return price.toLocaleString('vi-VN');
  }

  // Hàm tạo URL ảnh, giả định ảnh nằm trong thư mục assets/image/ hoặc tương tự
  getImageUrl(fileName: string): string {
    // Thay 'image/' bằng đường dẫn thực tế của thư mục ảnh trong Angular assets
    return `${fileName}`;
  }
  // searching sản phẩm
  // ===================== PRODUCT FILTER =====================
  applyProductsFilter() {
    this.filteredProducts = this.products.filter((item) => {
      const nameMatch =
        !this.searchProduct || item.ten_xe.toLowerCase().includes(this.searchProduct.toLowerCase());

      const categoryMatch =
        !this.filterCategory || item.kieu_dang?.toLowerCase() === this.filterCategory.toLowerCase();

      const seatsMatch =
        !this.filterSeats || String(item.so_cho_ngoi).trim() === String(this.filterSeats).trim();

      const bodyMatch = !this.filterBody || item.kieu_dang === this.filterBody;

      const fuelMatch = !this.filterBody || item.nhien_lieu === this.filterBody;

      const originMatch = !this.filterOrigin || item.xuat_xu === this.filterOrigin;

      // Bộ lọc giá (phân loại theo khoảng cố định)
      let priceMatch = true;
      if (this.filterPrice) {
        const price = Number(item.gia);
        switch (this.filterPrice) {
          case 'duoi500':
            priceMatch = price < 500000000;
            break;
          case '500to800':
            priceMatch = price >= 500000000 && price <= 800000000;
            break;
          case '800to1b':
            priceMatch = price > 800000000 && price <= 1000000000;
            break;
          case 'tren1b':
            priceMatch = price > 1000000000;
            break;
        }
      }

      return (
        nameMatch &&
        categoryMatch &&
        seatsMatch &&
        bodyMatch &&
        fuelMatch &&
        originMatch &&
        priceMatch
      );
    });
  }

  resetProductsFilter() {
    this.searchProduct = '';
    this.filterCategory = '';
    this.filterSeats = '';
    this.filterBody = '';
    this.filterOrigin = '';
    this.filterPrice = '';
    this.filteredProducts = this.products;
  }
}
