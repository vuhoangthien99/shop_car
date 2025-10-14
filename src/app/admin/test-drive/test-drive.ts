import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-test-drive',
  templateUrl: './test-drive.html',
  styleUrls: ['./test-drive.css'],
  imports: [CommonModule],
})
export class AdminTestDriveComponent implements OnInit {
  registrations: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading = true;
    this.http.get<any>('http://localhost/shop_car/api/dang-ky-lai-thu.php')
      .subscribe({
        next: (res) => {
          this.registrations = res.data || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Lỗi khi tải danh sách đăng ký!';
          this.loading = false;
          console.error(err);
        }
      });
  }

  updateStatus(id: number, action: 'approved' | 'rejected') {
    const adminName = 'Admin'; // hoặc lấy từ session
    this.http.post('http://localhost/shop_car/api/dang-ky-lai-thu.php', {
      id, action, admin: adminName
    }).subscribe({
      next: (res: any) => {
        alert(res.message || 'Cập nhật trạng thái thành công');
        this.loadRegistrations(); // reload danh sách
      },
      error: (err) => {
        alert('Cập nhật thất bại!');
        console.error(err);
      }
    });
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'pending': return 'text-warning';
      case 'approved': return 'text-success';
      case 'rejected': return 'text-danger';
      default: return '';
    }
  }
}
