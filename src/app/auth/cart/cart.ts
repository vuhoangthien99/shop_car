import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CartItem {
  id: number;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  selected?: boolean;
}

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  displayedItems: CartItem[] = [];
  cartItemCount = 0;
  totalAmount = 0;
  totalQuantity = 0;
  selectAll = false;
  searchText = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }
    this.loadCart(); // Lắng nghe sự thay đổi giỏ hàng từ AuthService (đảm bảo cập nhật khi có sync từ server)

    this.authService.cart$.subscribe((cart) => {
      // Giữ lại trạng thái selected hiện tại nếu có, nếu không thì mặc định là true
      this.cartItems = cart.map((item: any) => {
        const existingItem = this.cartItems.find((i) => i.id === item.id);
        return {
          ...item,
          selected: existingItem?.selected ?? true, // Giữ trạng thái chọn
        };
      });
      this.displayedItems = this.cartItems;
      this.cartItemCount = this.cartItems.length;
      this.calculateTotals();
    });
  }

  loadCart() {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItems = storedCart.map((item: any) => ({ ...item, selected: item.selected ?? true }));
    this.displayedItems = this.cartItems;
    this.cartItemCount = this.cartItems.length;
    this.selectAll = this.cartItems.every((item) => item.selected);
    this.calculateTotals();
  }

  searchCart() {
    const keyword = this.searchText.toLowerCase();
    this.displayedItems = this.cartItems.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  } // --- CHỈNH SỬA TÍNH TOÁN TỔNG (KHÔNG CẦN GỌI SERVICE) ---

  toggleSelection(item: CartItem) {
    // XÓA DÒNG NÀY: item.selected = !item.selected; // Giữ nguyên cách sửa lỗi bấm đúp

    // Ghi trạng thái selected (client-side) vào localStorage
    localStorage.setItem('cart', JSON.stringify(this.cartItems));

    this.selectAll = this.cartItems.every((i) => i.selected);
    this.calculateTotals();

    this.cdr.detectChanges();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.cartItems.forEach((item) => (item.selected = this.selectAll));
    // Cần lưu lại trạng thái selected vào localStorage
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.calculateTotals();
  } // --- CHỈNH SỬA: DÙNG AUTHSERVICE ĐỂ ĐỒNG BỘ ---

  updateQuantity(item: CartItem, event: any) {
    const newQty = Number(event.target.value);
    if (newQty > 0) {
      item.quantity = newQty;
      // GỌI PHƯƠNG THỨC MỚI TRONG AUTHSERVICE ĐỂ CẬP NHẬT VÀ SYNC
      this.authService.updateCartItemQuantity(item.id, newQty); // Không cần gọi calculateTotals hay localStorage.setItem ở đây
      // vì AuthService.cart$.subscribe sẽ lo việc cập nhật UI.
    }
  } // --- CHỈNH SỬA: DÙNG AUTHSERVICE ĐỂ ĐỒNG BỘ ---

  removeItem(item: CartItem) {
    // GỌI AUTHSERVICE ĐỂ XÓA VÀ SYNC
    this.authService.removeFromCart(item.id); // Không cần tự cập nhật mảng hay gọi loadCart()
    // vì AuthService.cart$.subscribe sẽ tự động cập nhật UI sau khi xóa.
  }

  calculateTotals() {
    this.totalAmount = this.cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    this.totalQuantity = this.cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  proceedToCheckout() {
    const selectedItems = this.cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
      return;
    }

    // Đảm bảo giỏ hàng hiện tại (đã chọn) được lưu vào localStorage
    localStorage.setItem('checkout_items', JSON.stringify(selectedItems));

    // CHÚ Ý: clearCart() sẽ xóa toàn bộ giỏ hàng, bao gồm cả server.
    // Nếu bạn muốn giữ lại các sản phẩm CHƯA được chọn, không nên gọi clearCart() ở đây.
    // Nếu quy trình là: Checkout xong, xóa các mặt hàng đã checkout khỏi giỏ hàng chính,
    // bạn sẽ cần một API mới: removeCheckedOutItems(selectedItems).

    // Tạm thời giữ nguyên logic của bạn:
    this.authService.clearCart();

    this.router.navigate(['/checkout']);
  }
}
