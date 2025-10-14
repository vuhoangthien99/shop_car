import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../../auth/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { NgZone, ChangeDetectorRef } from '@angular/core'; // Đảm bảo đã import
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [CommonModule, FormsModule],
})
export class Register {
  name!: string;
  email!: string;
  password!: string;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private zone: NgZone, // Đã inject
    private cdr: ChangeDetectorRef // Đã inject
  ) { }

  onRegisterSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    const userData: RegisterData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.zone.run(() => {
        this.authService.register(userData).subscribe({
            next: (response) => {
                console.log("Đăng ký thành công:", response.user_id);
                this.successMessage = response.message;
                
                // === BẮT BUỘC: ÉP CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC ===
                this.cdr.detectChanges(); 

                // Chuyển hướng sau 3 giây (Đã nằm trong zone.run() nên sẽ ổn)
                setTimeout(() => {
                    // router.navigate() đã chạy trong zone, không cần zone.run() riêng.
                    this.router.navigate(['/auth/login']); 
                }, 3000);
            },
            error: (err: HttpErrorResponse) => {
                console.error('LỖI ĐĂNG KÝ:', err);
                
                if (err.error && err.error.message) {
                    this.errorMessage = err.error.message; 
                } else {
                    this.errorMessage = 'Lỗi kết nối hoặc lỗi máy chủ không xác định.';
                }
                
                this.cdr.detectChanges(); 
            }
        });
    });
  }
}
