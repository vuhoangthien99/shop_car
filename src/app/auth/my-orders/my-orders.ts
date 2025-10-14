import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError, throwError, take, filter, tap } from 'rxjs'; 

// Import Service và các Interface gốc (Order, OrderStatus, User)
import { AdminService, Order, OrderStatus, User } from '../../admin/admin-service'; 
import { AuthService } from '../auth';

// --- ĐỊNH NGHĨA INTERFACE MỚI (Khắc phục lỗi TypeScript) ---

export interface OrderDetail {
  id: number; // Order Item ID (hoặc Product ID)
  product_id: number;
  quantity: number;
  price_at_order: number; // Giá sản phẩm tại thời điểm đặt hàng
  subtotal: number; // Tổng giá trị của riêng sản phẩm này (TÍNH TOÁN Ở CLIENT)
  product_name: string;
  image_url: string;
}

// Cập nhật lại DetailedOrder để sử dụng mảng OrderDetail mới
// (Giả định DetailedOrder đã được import từ admin-service, nhưng ta cần định nghĩa lại
// để thêm OrderDetail đã sửa subtotal)
export interface DetailedOrderWithSubtotal {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    total_amount: number;
    status: string;
    order_date: string;
    details: OrderDetail[]; // Sử dụng OrderDetail đã thêm subtotal
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CurrencyPipe, DatePipe],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.css'],
})
export class MyOrdersComponent implements OnInit {
  userId!: number;
  myOrders: Order[] = [];
  // Sử dụng interface mới để hỗ trợ thuộc tính subtotal
  selectedOrder: DetailedOrderWithSubtotal | null = null; 
  isLoading = true;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // FIX LỖI TẢI LẠI TRANG: Đảm bảo lắng nghe trạng thái user đã ổn định.
    this.authService.user$
      .pipe(
        // Lấy giá trị đầu tiên (trạng thái đã được khôi phục từ storage)
        take(1)
      )
      .subscribe((user: User | null) => {
        // User interface được import từ admin-service.ts
        if (user && user.id) {
          // 1. Trạng thái đã ổn định VÀ có User
          this.userId = user.id;
          this.loadMyOrders();
        } else {
          // 2. Trạng thái đã ổn định VÀ không có User
          this.error = 'Vui lòng đăng nhập để xem lịch sử đơn hàng.';
          this.isLoading = false;
        }
      });
  }

  loadMyOrders() {
    this.isLoading = true;
    this.error = null;

    // GỌI API ĐƠN HÀNG
    this.adminService
      .getOrdersByUserId(this.userId)
      .pipe(
        catchError((err) => {
          this.error = 'Lỗi khi tải danh sách đơn hàng. Vui lòng kiểm tra kết nối API.';
          this.isLoading = false;
          this.cdr.detectChanges(); 
          return throwError(() => err);
        })
      )
      .subscribe((orders) => {
        this.myOrders = orders;
        this.isLoading = false;

        this.cdr.detectChanges();
      });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = null;
    this.adminService
      .getOrderDetail(order.id)
      .pipe(
        catchError((err) => {
          // Thay thế alert bằng một modal hoặc thông báo toast trong môi trường production
          console.error('Không thể tải chi tiết đơn hàng:', err); 
          alert('Không thể tải chi tiết đơn hàng.'); 
          return throwError(() => err);
        })
      )
      // Ép kiểu đầu ra thành DetailedOrderWithSubtotal để sử dụng thuộc tính 'details'
      .subscribe((detail: any) => { 
        
        // 1. TÍNH TOÁN SUBTOTOAL cho từng chi tiết đơn hàng
        detail.details = detail.details.map((item: any) => ({
          ...item,
          // Thêm thuộc tính 'subtotal' bằng cách nhân giá (price_at_order) với số lượng (quantity)
          subtotal: item.price_at_order * item.quantity,
        })) as OrderDetail[]; // Ép kiểu để khớp với interface đã cập nhật

        // 2. Gán dữ liệu đã xử lý vào biến trạng thái
        this.selectedOrder = detail as DetailedOrderWithSubtotal;

        // 3. Ép Angular cập nhật giao diện
        this.cdr.detectChanges();
      });
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  // Hàm hiển thị trạng thái bằng tiếng Việt
  getStatusLabel(status: OrderStatus | string): string {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'returned':
        return 'Đã trả hàng';
      default:
        return 'Không rõ';
    }
  }
}
