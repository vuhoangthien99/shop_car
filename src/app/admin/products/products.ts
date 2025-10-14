import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  products: Product[] = [];
  apiUrl = 'http://localhost/shop_car/api/products.php';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: data => this.products = data,
      error: err => console.error('Lỗi tải sản phẩm:', err)
    });
  }
}
