import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  users: User[] = [];
  isLoading = signal<boolean>(true);
  errorOccurred = signal<boolean>(false);
  apiUrl = 'http://localhost/shop_car/api/users.php';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading.set(false);
        this.errorOccurred.set(false);
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Lỗi tải người dùng:', err),
    });
  }
}
