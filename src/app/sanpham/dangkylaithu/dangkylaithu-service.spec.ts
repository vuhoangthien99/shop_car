import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Định nghĩa Interface Dữ liệu ---

/** Dữ liệu gửi đi từ Angular đến PHP Backend */
export interface TestDriveData { // 👈 ĐÃ ĐƯỢC EXPORT
    xe_id: number;
    fullname: string;
    phone: string;
    city: string;
    dealer: string;
    date: string | null; // Ngày có thể là null
    license: boolean;
    agreeInfo: boolean;
    policy: boolean;
}

/** Dữ liệu phản hồi nhận về từ PHP Backend */
export interface TestDriveResponse { // 👈 ĐÃ ĐƯỢC EXPORT
    message: string;
    id: number; // ID đăng ký vừa được tạo
}

// --- Service ---

@Injectable({
  providedIn: 'root'
})
export class DangkylaithuService {

  // ⚠️ CẦN THAY THẾ BẰNG URL API THỰC TẾ CỦA BẠN ⚠️
  private apiUrl = 'http://localhost/shop_car/api/dang-ky-lai-thu.php'; 

  constructor(private http: HttpClient) { }

  /**
   * Gửi thông tin đăng ký lái thử đến Backend.
   * @param data Dữ liệu đăng ký lái thử (TestDriveData)
   * @returns Observable với phản hồi từ server
   */
  register(data: TestDriveData): Observable<TestDriveResponse> {
    return this.http.post<TestDriveResponse>(this.apiUrl, data);
  }
}
