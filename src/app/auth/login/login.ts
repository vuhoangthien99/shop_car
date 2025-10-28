import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserData } from '../../auth/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email!: string;
  password!: string;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  // Hàm gọi khi submit form login
  onLoginSubmit(): void {
    this.errorMessage = ''; // Xóa lỗi cũ

    // Gói cuộc gọi API vào zone.run() để Angular theo dõi thay đổi
    this.zone.run(() => {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          // Thông báo console (debug)
          console.log('Đăng nhập thành công:', response.user.name);

          // Redirect dựa trên role
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']); // Trang quản trị
          } else {
            this.router.navigate(['/']); // Trang user
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi đăng nhập:', err);

          // Xử lý thông báo lỗi từ PHP JSON
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.status === 401) {
            this.errorMessage = 'Sai email hoặc mật khẩu.';
          } else if (err.status === 404) {
            this.errorMessage = 'Email không tồn tại.';
          } else {
            this.errorMessage = 'Lỗi kết nối không xác định. Vui lòng thử lại.';
          }

          // Cập nhật giao diện ngay lập tức
          this.cdr.detectChanges();
        },
      });
    });
  }
}
