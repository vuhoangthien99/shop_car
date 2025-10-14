import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DangKyLaiThuService {
  private apiUrl = 'http://localhost/shop_car/api/dang-ky-lai-thu.php';

  constructor(private http: HttpClient) {}

  registerTestDrive(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
