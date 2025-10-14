import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserData } from '../auth';
import { catchError, throwError } from 'rxjs'; // Đảm bảo import throwError và catchError

// --- Interfaces ---
export interface CartItem {
  id: number; // ID sản phẩm
  name: string;
  price: number;
  quantity: number;
  selected?: boolean;
}

// Interface cho phản hồi từ API checkout
export interface CheckoutResponse {
  message: string;
  order_id: number;
}
// -----------------

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit {
  // --- Biến dữ liệu ---
  public items: CartItem[] = [];
  public totalAmount: number = 0;
  public totalQuantity: number = 0;
  public paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' = 'cash';
  public processing: boolean = false;
  public errorMessage: string | null = null;
  
  // NOTE: Sử dụng orders.php cho cả GET và POST tạo đơn hàng
  private readonly apiUrl = 'http://localhost/shop_car/api/orders.php'; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Kiểm tra đăng nhập
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // 2. Tải các mặt hàng đã chọn
    this.loadSelectedItems();
  }

  loadSelectedItems(): void {
    const storedItems = localStorage.getItem('checkout_items');
    
    if (storedItems) {
      this.items = JSON.parse(storedItems);
      
      if (this.items.length === 0) {
        alert('Không có sản phẩm nào được chọn để thanh toán. Quay lại giỏ hàng.');
        this.router.navigate(['/cart']);
        return;
      }
      
      // Tính toán tổng tiền và số lượng
      this.calculateTotals();

    } else {
      alert('Giỏ hàng thanh toán trống. Vui lòng chọn sản phẩm từ Giỏ hàng.');
      this.router.navigate(['/cart']);
    }
  }
  
  calculateTotals(): void {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- XỬ LÝ THANH TOÁN ---
  processCheckout(): void {
    this.errorMessage = null;
    const user = this.authService.getUser();

    if (!user || this.items.length === 0 || this.processing) {
      if (!user) this.router.navigate(['/login']);
      return;
    }

    this.processing = true;

    // 1. Chuẩn bị Payload cho API
    const itemsForServer = this.items.map(item => ({
      // >>> KHẮC PHỤC LỖI: Đổi 'id' thành 'product_id' để khớp với PHP API
      product_id: item.id, 
      quantity: item.quantity,
      // KHÔNG CẦN GỬI 'price', PHP sẽ tự lấy price_at_order từ bảng products
      // price: item.price 
    }));

    const payload = {
      user_id: user.id,
      total_amount: this.totalAmount,
      items: itemsForServer,
      payment_method: this.paymentMethod
    };
    
    console.log('Sending checkout payload:', payload);

    // 2. Gửi yêu cầu POST tới API
    this.http.post<CheckoutResponse>(this.apiUrl, payload).subscribe({
      next: (response) => {
        alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${response.order_id}`);
        
        // 3. Dọn dẹp Local Storage
        localStorage.removeItem('checkout_items');
        // VÀ BẢNG CART trong Local Storage nếu bạn có!
        // localStorage.removeItem('cart_items'); 
        this.items = []; // Xóa dữ liệu hiển thị

        // 4. Điều hướng
        this.router.navigate(['/order-success', response.order_id]);
      },
      error: (err) => {
        console.error('Lỗi khi tạo đơn hàng:', err);
        // Hiển thị lỗi chi tiết hơn nếu có sẵn từ response error
        const apiErrorMessage = err.error?.message || 'Lỗi không xác định từ máy chủ.';
        this.errorMessage = `Thanh toán thất bại. Lỗi: ${apiErrorMessage}`;
        this.processing = false;
      }
    });
  }
}
