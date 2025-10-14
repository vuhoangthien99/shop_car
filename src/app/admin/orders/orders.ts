import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  order_date: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  orders: Order[] = [];
  apiUrl = 'http://localhost/shop_car/api/orders.php';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Order[]>(this.apiUrl).subscribe({
      next: data => this.orders = data,
      error: err => console.error('Lỗi tải đơn hàng:', err)
    });
  }
}
