// src/app/auth/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
// Không cần import User từ admin-service, chỉ dùng interface UserData định nghĩa tại đây.
// import { User } from '../admin/admin-service'; // ĐÃ XÓA

// Định nghĩa Interface dữ liệu người dùng
export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  message: string;
  user: UserData;
  token: string;
}

// Thêm interface cho dữ liệu đăng ký
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Thêm interface cho phản hồi đăng ký
export interface RegisterResponse {
  message: string;
  user_id: number;
}

// Interface cho CartItem (đảm bảo đồng nhất)
export interface CartItem {
  id: number; // Đây là Product ID
  name: string;
  price: number;
  quantity: number;
  selected?: boolean; // Thuộc tính client-side
  image_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost/shop_car/api/';
  private userToken: string | null = null;
  private currentUser: UserData | null = null;
  
  // BEHAVIORSUBJECT CHÍNH (NGUỒN DỮ LIỆU DUY NHẤT CHO MYORDERSCOMPONENT)
  public user$ = new BehaviorSubject<UserData | null>(null); 

  // Khởi tạo BehaviorSubject với giỏ hàng được tải từ Local Storage
  public cart$ = new BehaviorSubject<CartItem[]>(this.loadCartFromLocal());

  constructor(private http: HttpClient) {
    // loadToken() sẽ thực hiện cả việc tải user và cập nhật user$.next()
    this.loadToken(); 
    // ĐÃ XÓA: this.loadInitialUser(); (Vì logic này trùng với loadToken)
  }
  
  // ĐÃ XÓA: private _userSubject = new BehaviorSubject<User | null>(null); 
  // ĐÃ XÓA: private loadInitialUser() { ... }

  // --- HÀM ĐĂNG KÝ ---
  register(data: RegisterData): Observable<RegisterResponse> {
    const registerUrl = this.apiUrl + 'register.php';
    return this.http.post<RegisterResponse>(registerUrl, data);
  }

  // --- HÀM ĐĂNG NHẬP ---
  login(email: string, password: string): Observable<AuthResponse> {
    const credentials = { email, password };
    const loginUrl = this.apiUrl + 'login.php';

    return this.http.post<AuthResponse>(loginUrl, credentials).pipe(
      tap((response) => {
        this.saveAuthData(response.token, response.user);
      })
    );
  }

  // --- HÀM XỬ LÝ DỮ LIỆU SAU ĐĂNG NHẬP ---
  private saveAuthData(token: string, user: UserData): void {
    this.userToken = token;
    this.currentUser = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
    
    // CẬP NHẬT TRẠNG THÁI CHO USER$
    this.user$.next(user);

    // BƯỚC QUAN TRỌNG: Tải giỏ hàng từ Server và gộp với giỏ hàng Local
    this.getCartFromServer(user.id).subscribe({
      next: (serverCart) => {
        const localCart = this.loadCartFromLocal();
        const finalCart = this.mergeCarts(localCart, serverCart);

        // Cập nhật Local Storage, BehaviorSubject và Server
        this.saveCartToLocal(finalCart);
        this.cart$.next(finalCart);
        this.syncCartToServer(user.id, finalCart);
      },
      error: (err) => console.error('Lỗi tải giỏ hàng server:', err),
    });
  }

  // --- HÀM GỘP GIỎ HÀNG MỚI ---
  private mergeCarts(localCart: CartItem[], serverCart: CartItem[]): CartItem[] {
    const mergedMap = new Map<number, CartItem>();

    // Thêm các mục từ server (làm cơ sở)
    serverCart.forEach((item) => mergedMap.set(item.id, { ...item }));

    // Gộp/Cộng dồn các mục từ local (ưu tiên)
    localCart.forEach((item) => {
      const existing = mergedMap.get(item.id);
      if (existing) {
        // Nếu cùng sản phẩm, cộng dồn số lượng
        existing.quantity += item.quantity;
      } else {
        // Thêm mục chỉ có trong local
        mergedMap.set(item.id, { ...item });
      }
    });

    return Array.from(mergedMap.values());
  }

  // --- HÀM ĐĂNG XUẤT ---
  logout(): void {
    this.userToken = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // CẬP NHẬT TRẠNG THÁI CHO USER$
    this.user$.next(null);
  }

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated(): boolean {
    return !!this.userToken;
  }

  // Tải Token từ Local Storage VÀ KHÔI PHỤC SESSION
  private loadToken(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_info');
    
    if (token && user) {
      try {
        const userData: UserData = JSON.parse(user);
        this.userToken = token;
        this.currentUser = userData;
        
        // CẬP NHẬT TRẠNG THÁI CHO USER$ (Khắc phục lỗi MyOrders)
        this.user$.next(this.currentUser); 
      } catch (e) {
        console.error('Lỗi khôi phục user từ LocalStorage', e);
        this.logout();
      }
    }
    // Nếu không có token/user, user$ vẫn giữ giá trị khởi tạo là null,
    // đảm bảo MyOrdersComponent nhận được trạng thái ổn định ngay lập tức.
  }

  getToken(): string | null {
    return this.userToken;
  }

  getUser(): UserData | null {
    return this.currentUser;
  }
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // =======================================================
  // CÁC HÀM XỬ LÝ GIỎ HÀNG
  // =======================================================

  // Hàm tải giỏ hàng từ Local Storage
  private loadCartFromLocal(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  // Hàm lưu giỏ hàng vào Local Storage
  private saveCartToLocal(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // --- HÀM THÊM VÀO GIỎ HÀNG ---
  addToCart(product: any) {
    const cart: CartItem[] = this.loadCartFromLocal();
    const existing = cart.find((i) => i.id === product.id);

    if (existing) existing.quantity += 1;
    else
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
      });

    this.saveCartToLocal(cart);
    this.cart$.next(cart);

    // Đồng bộ lên Server nếu user đã đăng nhập
    if (this.currentUser) this.syncCartToServer(this.currentUser.id, cart);
  }

  // --- HÀM XÓA KHỎI GIỎ HÀNG ---
  removeFromCart(productId: number) {
    // 1. Xóa cục bộ (để cập nhật UI ngay lập tức)
    const cart = this.loadCartFromLocal().filter((i) => i.id !== productId);
    this.saveCartToLocal(cart);
    this.cart$.next(cart);

    // 2. Xóa trên Server nếu user đã đăng nhập
    if (this.currentUser) {
      // Gọi API xóa mục cụ thể
      this.http
        .post(this.apiUrl + 'delete_cart_item.php', {
          user_id: this.currentUser.id,
          product_id: productId,
        })
        .subscribe({
          next: (res) => {
            console.log('Xóa mục giỏ hàng server thành công:', res);
          },
          error: (err) => {
            console.error('Lỗi khi xóa mục giỏ hàng server:', err);
          },
        });
    }
  }

  // --- HÀM XÓA HẾT GIỎ HÀNG ---
  clearCart() {
    localStorage.removeItem('cart');
    this.cart$.next([]);

    // Gửi yêu cầu xóa giỏ hàng trên Server
    if (this.currentUser) {
      this.http.post(this.apiUrl + 'clear_cart.php', { user_id: this.currentUser.id }).subscribe({
        error: (err) => console.error('Lỗi khi xóa giỏ hàng server:', err),
      });
    }
  }

  // --- HÀM TẢI GIỎ HÀNG TỪ SERVER ---
  getCartFromServer(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}get_cart.php?user_id=${userId}`);
  }

  // --- HÀM ĐỒNG BỘ LÊN SERVER ---
  private syncCartToServer(userId: number, cart: CartItem[]) {
    this.http.post(this.apiUrl + 'save_cart.php', { user_id: userId, items: cart }).subscribe({
      error: (err) => console.error('Lỗi đồng bộ giỏ hàng lên server:', err),
    });
  }
  
  // --- HÀM MỚI: CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG ---
  updateCartItemQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const cart: CartItem[] = this.loadCartFromLocal();
    const itemToUpdate = cart.find((i) => i.id === itemId);

    if (itemToUpdate) {
      itemToUpdate.quantity = newQuantity;

      this.saveCartToLocal(cart);
      this.cart$.next(cart);

      if (this.currentUser) {
        this.syncCartToServer(this.currentUser.id, cart);
      }
    }
  }
}